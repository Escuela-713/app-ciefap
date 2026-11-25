from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import math

from .calculations import formula_eval
from .models import Plantacion, Medicion, ArbolMedido
from .serializers import (
    InputPlantacionSerializer,
    InputMedicionSerializer,
    PlantacionSerializer,
)


def calcular_arbol(dap, height):
    ev = formula_eval.evaluar
    dimensiones_arbol = {'dap_cm': dap, 'height_m': height}

    biomasa_aerea = ev('biomasa_aerea_total', dimensiones_arbol)
    biomasa_raiz_arbol = ev('biomasa_raiz', {'biomasa_aerea_total': biomasa_aerea})

    return {
        'dap_cm': dap,
        'height_m': height,
        'basal_area': ev('basal_area', {'dap_cm': dap}),
        'volumen_total_cc': ev('volumen_total_cc', dimensiones_arbol),
        'volumen_total_sc': ev('volumen_total_sc', dimensiones_arbol),
        'volumen_maderable_cc': ev('volumen_maderable_cc', dimensiones_arbol),
        'volumen_maderable_sc': ev('volumen_maderable_sc', dimensiones_arbol),
        'biomasa_aerea_total': biomasa_aerea,
        'biomasa_raiz': biomasa_raiz_arbol,
        'biomasa_total': ev(
            'biomasa_total',
            {'biomasa_aerea_total': biomasa_aerea, 'biomasa_raiz': biomasa_raiz_arbol},
        ),
    }

def calcular_altura_dominante(filas, tamano_parcela):
    """Promedio de altura de los troncos más gruesos: 100 por hectárea, por regla de 3."""
    cantidad = max(1, int(100 * tamano_parcela / 10000))
    mas_gruesos = sorted(filas, key=lambda fila: fila['dap_cm'], reverse=True)[:cantidad]
    return sum(fila['height_m'] for fila in mas_gruesos) / len(mas_gruesos)

def calcular_parcela(fila, entre_fila, cantidad_arboles):
    ev = formula_eval.evaluar
    tamano = ev('tamano_parcela', {'dis_arboles_fila': fila, 'dis_arboles_entre_fila': entre_fila})
    radio = ev('radio_parcela', {'tamano_parcela': tamano})
    arboles_ha = ev('arboles_ha', {'cantidad_arboles': cantidad_arboles, 'tamano_parcela': tamano})
    return tamano, radio, arboles_ha

def redondear_dos_decimales(fila):
    return {
        clave: round(valor, 2) if isinstance(valor, float) else valor
        for clave, valor in fila.items()
    }

@api_view(['POST'])
def crear_plantacion(request):
    entrada = InputPlantacionSerializer(data=request.data)
    entrada.is_valid(raise_exception=True)
    datos = entrada.validated_data
    ev = formula_eval.evaluar

    tamano = ev('tamano_parcela', {
        'cantidad_arboles': datos['cantidad_arboles'],
        'dis_arboles_fila': datos['dis_arboles_fila'],
        'dis_arboles_entre_fila': datos['dis_arboles_entre_fila'],
    })
    radio = ev('radio_parcela', {'tamano_parcela': tamano})

    plantacion = Plantacion.objects.create(
        dis_arboles_fila=datos['dis_arboles_fila'],
        dis_arboles_entre_fila=datos['dis_arboles_entre_fila'],
        cantidad_arboles=datos['cantidad_arboles'],
        tamano_parcela=tamano,
        radio_parcela=radio,
    )

    return Response(
        {'exito': True, 'plantacion': PlantacionSerializer(plantacion).data},
        status=status.HTTP_201_CREATED,
    )

@api_view(['POST'])
def crear_medicion(request, pk):
    plantacion = get_object_or_404(Plantacion, pk=pk)

    entrada = InputMedicionSerializer(data=request.data)
    entrada.is_valid(raise_exception=True)
    datos = entrada.validated_data

    if len(datos['arboles']) != plantacion.cantidad_arboles:
        return Response(
            {
                'exito': False,
                'error': (
                    f"Se esperaban {plantacion.cantidad_arboles} árboles "
                    f"y llegaron {len(datos['arboles'])}"
                ),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    filas = [calcular_arbol(a['dap_cm'], a['height_m']) for a in datos['arboles']]

    tamano = plantacion.tamano_parcela
    edad = datos['edad']
    ev = formula_eval.evaluar

    def suma(campo):
        return sum(fila[campo] for fila in filas)

    def media(campo):
        return suma(campo) / len(filas)

    def por_hectarea(total):
        return ev('por_ha', {'valor_total': total, 'tamano_parcela': tamano})

    def biomasa_por_hectarea(total):
        return ev('biomasa_ha', {'valor_total': total, 'tamano_parcela': tamano})

    altura_dominante = calcular_altura_dominante(filas, tamano)
    arboles_ha = ev('arboles_ha', {
        'cantidad_arboles': plantacion.cantidad_arboles,
        'tamano_parcela': tamano,
    })
    dias = ev('dias', {'edad': edad})
    indice_sitio = ev('indice_sitio', {'altura_dominante': altura_dominante, 'edad': edad})

    biomasa_total_ha = biomasa_por_hectarea(suma('biomasa_total'))
    captacion_bosque = ev('captacion_bosque', {'biomasa_total_ha': biomasa_total_ha})
    captacion_diaria = ev('captacion_diaria', {'captacion_bosque': captacion_bosque, 'dias': dias})
    emision_diaria = ev('emision_diaria', {})
    punto_equilibrio = ev('punto_equilibrio', {
        'captacion_diaria': captacion_diaria,
        'emision_diaria': emision_diaria,
    })

    with transaction.atomic():
        medicion = Medicion.objects.create(
            plantacion=plantacion,
            fecha=datos['fecha'],
            edad=edad,
            dap_cm_media=math.sqrt(sum(f['dap_cm'] ** 2 for f in filas) / len(filas)),
            height_m_media=media('height_m'),
            altura_dominante=altura_dominante,
            arboles_ha=round(arboles_ha),
            basal_area_total=suma('basal_area'),
            basal_ha=por_hectarea(suma('basal_area')),
            volumen_total_cc_suma=suma('volumen_total_cc'),
            volumen_total_sc_suma=suma('volumen_total_sc'),
            volumen_maderable_cc_suma=suma('volumen_maderable_cc'),
            volumen_maderable_sc_suma=suma('volumen_maderable_sc'),
            volumen_total_cc_ha=por_hectarea(suma('volumen_total_cc')),
            volumen_total_sc_ha=por_hectarea(suma('volumen_total_sc')),
            volumen_maderable_cc_ha=por_hectarea(suma('volumen_maderable_cc')),
            volumen_maderable_sc_ha=por_hectarea(suma('volumen_maderable_sc')),
            biomasa_aerea_total_suma=suma('biomasa_aerea_total'),
            biomasa_aerea_total_ha=biomasa_por_hectarea(suma('biomasa_aerea_total')),
            biomasa_raiz_ha=biomasa_por_hectarea(suma('biomasa_raiz')),
            biomasa_total_suma=suma('biomasa_total'),
            biomasa_total_ha=biomasa_total_ha,
            captacion_bosque=captacion_bosque,
            indice_sitio=indice_sitio,
            dias=dias,
            captacion_diaria=captacion_diaria,
            emision_diaria=emision_diaria,
            punto_equilibrio=math.floor(punto_equilibrio),
        )

        ArbolMedido.objects.bulk_create([
            ArbolMedido(
                medicion=medicion,
                plantacion=plantacion,
                numero_arbol=numero_arbol,
                **fila,
            )
            for numero_arbol, fila in enumerate(filas, start=1)
        ])

    return Response(
        {'exito': True, 'id_medicion': medicion.id_medicion, 'arboles_guardados': len(filas)},
        status=status.HTTP_201_CREATED,
    )

@api_view(['GET'])
def resumen_plantacion(request, pk):
    plantacion = get_object_or_404(Plantacion, pk=pk)

    mediciones = Medicion.objects.filter(plantacion=plantacion).values(
        'id_medicion', 'fecha', 'edad', 'dap_cm_media', 'height_m_media',
        'altura_dominante', 'arboles_ha', 'basal_ha',
        'volumen_total_cc_ha', 'volumen_total_sc_ha',
        'volumen_maderable_cc_ha', 'volumen_maderable_sc_ha',
        'biomasa_aerea_total_ha', 'biomasa_raiz_ha', 'biomasa_total_ha',
        'captacion_bosque', 'indice_sitio', 'dias',
        'captacion_diaria', 'emision_diaria', 'punto_equilibrio',
    )

    return Response({
        'id_plantacion': plantacion.id_plantacion,
        'tamano_parcela': round(plantacion.tamano_parcela, 2),
        'radio_parcela': round(plantacion.radio_parcela, 2),
        'cantidad_arboles': plantacion.cantidad_arboles,
        'mediciones': [redondear_dos_decimales(m) for m in mediciones],
    })

@api_view(['GET'])
def arboles_de_medicion(request, pk):
    medicion = get_object_or_404(Medicion, pk=pk)
    arboles = ArbolMedido.objects.filter(medicion=medicion).values()
    return Response({
        'id_medicion': medicion.id_medicion,
        'arboles': list(arboles),
    })


#estos quedaron de prueba

@api_view(['POST'])
def calcular_basal_area(request):
    
    dap_cm = request.data.get('dap_cm')

    dap_cm = float(dap_cm)

    resultado = formula_eval.evaluar('basal_area', {'dap_cm': dap_cm})
    resultado = round(resultado, 4)

    return Response({
        'exito': True,
        'resultado': resultado,
        'unidad': 'm2',
        'dap_cm': dap_cm}, status=status.HTTP_200_OK)

@api_view(['POST'])
def calcular_diametro_altura_pecho(request):
    
    dap_cm = request.data.get('dap_cm')

    dap_cm = float(dap_cm)

    resultado = formula_eval.evaluar('diametro_altura_pecho', {'dap_cm': dap_cm})
    resultado = round(resultado, 4)

    return Response({
        'exito': True,
        'resultado': resultado,
        'unidad': 'm2',
        'dap_cm': dap_cm}, status=status.HTTP_200_OK)

@api_view(['POST'])
def calcular_volumen_total_cc(request):
    
    dap_cm = request.data.get('dap_cm')
    height_m = request.data.get('height_m')


    dap_cm = float(dap_cm)
    height_m = float(height_m)

    resultado = formula_eval.evaluar('volumen_total_cc', {'dap_cm': dap_cm, 'height_m': height_m})
    resultado = round(resultado, 4)


    return Response({
        'exito': True,
        'resultado': resultado,
        'dap_cm': dap_cm,
        'height_m': height_m}, status=status.HTTP_200_OK)

@api_view(['POST'])
def calcular_volumen_total_sc(request):
    
    dap_cm = request.data.get('dap_cm')
    height_m = request.data.get('height_m')


    dap_cm = float(dap_cm)
    height_m = float(height_m)

    resultado = formula_eval.evaluar('volumen_total_sc', {'dap_cm': dap_cm, 'height_m': height_m})
    resultado = round(resultado, 4)


    return Response({
        'exito': True,
        'resultado': resultado,
        'dap_cm': dap_cm,
        'height_m': height_m}, status=status.HTTP_200_OK)

@api_view(['POST'])
def calcular_volumen_maderable_cc(request):
    
    dap_cm = request.data.get('dap_cm')
    height_m = request.data.get('height_m')


    dap_cm = float(dap_cm)
    height_m = float(height_m)

    resultado = formula_eval.evaluar('volumen_maderable_cc', {'dap_cm': dap_cm, 'height_m': height_m})
    resultado = round(resultado, 4)


    return Response({
        'exito': True,
        'resultado': resultado,
        'dap_cm': dap_cm,
        'height_m': height_m}, status=status.HTTP_200_OK)

@api_view(['POST'])
def calcular_volumen_maderable_sc(request):
    
    dap_cm = request.data.get('dap_cm')
    height_m = request.data.get('height_m')


    dap_cm = float(dap_cm)
    height_m = float(height_m)

    resultado = formula_eval.evaluar('volumen_maderable_sc', {'dap_cm': dap_cm, 'height_m': height_m})
    resultado = round(resultado, 4)


    return Response({
        'exito': True,
        'resultado': resultado,
        'dap_cm': dap_cm,
        'height_m': height_m}, status=status.HTTP_200_OK)

@api_view(['POST'])
def calcular_biomasa_aerea_total(request):
    
    dap_cm = request.data.get('dap_cm')
    height_m = request.data.get('height_m')

    dap_cm = float(dap_cm)
    height_m = float(height_m)

    resultado = formula_eval.evaluar('biomasa_aerea_total', {'dap_cm': dap_cm, 'height_m': height_m})
    resultado = round(resultado, 4)

    return Response({
        'exito': True,
        'resultado': resultado,
        'unidad': 'm2',
        'dap_cm': dap_cm}, status=status.HTTP_200_OK)

@api_view(['POST'])
def calcular_biomasa_raiz(request):

    valores = {
        'dap_cm': float(request.data['dap_cm']),
        'height_m': float(request.data['height_m']),
    }

    biomasa_aerea_total = formula_eval.evaluar('biomasa_aerea_total', valores)
    biomasa_raiz = formula_eval.evaluar('biomasa_raiz', {'biomasa_aerea_total': biomasa_aerea_total})

    return Response({
        'exito': True, 
        'resultado': round(biomasa_raiz, 4), 
        'unidad': 'kg'
    })

@api_view(['POST'])
def calcular_biomasa_total(request):

    valores = {
        'dap_cm': float(request.data['dap_cm']),
        'height_m': float(request.data['height_m']),
    }

    biomasa_aerea_total = formula_eval.evaluar('biomasa_aerea_total', valores)
    biomasa_raiz = formula_eval.evaluar('biomasa_raiz', {'biomasa_aerea_total': biomasa_aerea_total})
    biomasa_total = formula_eval.evaluar('biomasa_total', {'biomasa_aerea_total': biomasa_aerea_total, 'biomasa_raiz': biomasa_raiz})

    return Response({
        'exito': True, 
        'resultado': round(biomasa_total, 4), 
        'unidad': 'kg'
    })

