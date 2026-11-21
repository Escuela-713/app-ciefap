from django.db import models

from django.conf import settings
from django.db import models


class Plantacion(models.Model):
    id_plantacion = models.AutoField(primary_key=True, db_column='id_plantacion')

    dis_arboles_fila = models.FloatField(db_column='dis_arboles_fila')
    dis_arboles_entre_fila = models.FloatField(db_column='dis_arboles_entre_fila')
    tamano_parcela = models.FloatField(db_column='tamaño_parcela')
    radio_parcela = models.FloatField(db_column='radio_parcela')
    cantidad_arboles = models.FloatField(db_column='cantidad_arboles')
    cantidad_arboles_ha = models.FloatField(db_column='cantidad_arboles_ha')
    basal_ha = models.FloatField(db_column='basal_ha')
    volumen_total_cc_ha = models.FloatField(db_column='volumen_total_cc_ha')
    volumen_total_sc_ha = models.FloatField(db_column='volumen_total_sc_ha')
    volumen_maderable_cc_ha = models.FloatField(db_column='volumen_maderable_cc_ha')
    volumen_maderable_sc_ha = models.FloatField(db_column='volumen_maderable_sc_ha')
    biomasa_aerea_total_ha = models.FloatField(db_column='biomasa_aerea_total_ha')
    biomasa_raiz_ha = models.FloatField(db_column='biomasa_raiz_ha')
    biomasa_total_ha = models.FloatField(db_column='biomasa_total_ha')
    captacion_bosque = models.FloatField(db_column='captacion_bosque')
    class Meta:
        db_table = 'plantacion'

    def __str__(self):
        return f'Plantación {self.id_plantacion}'

class Medicion(models.Model):
    id_medicion = models.AutoField(primary_key=True, db_column='id_medicion')

    fecha = models.CharField(max_length=45, db_column='fecha')
    edad = models.CharField(max_length=45, db_column='edad')
    dap_cm_media = models.FloatField(db_column='dap_cm_media')
    height_m_media = models.FloatField(db_column='height_m_media')
    basal_area_total = models.FloatField(db_column='basal_area_total')
    volumen_total_cc_suma = models.FloatField(db_column='volumen_total_cc_suma')
    volumen_total_sc_suma = models.FloatField(db_column='volumen_total_sc_suma')
    volumen_maderable_cc_suma = models.FloatField(db_column='volumen_maderable_cc_suma')
    volumen_maderable_sc_suma = models.FloatField(db_column='volumen_maderable_sc_suma')
    biomasa_aerea_total_suma = models.FloatField(db_column='biomasa_aerea_total_suma')
    biomasa_aerea_total_suma_2 = models.FloatField(db_column='biomasa_aerea_total_suma_2')
    biomasa_total_suma = models.FloatField(db_column='biomasa_total_suma')
    indice_sitio = models.FloatField(db_column='indice_sitio')
    dias = models.FloatField(db_column='dias')
    captacion_diaria = models.FloatField(db_column='captacion_diaria')
    emision_diaria = models.FloatField(db_column='emicion_diaria')
    punto_equilibrio = models.FloatField(db_column='punto_equilibrio')

    plantacion = models.ForeignKey(
        Plantacion,
        on_delete=models.CASCADE,
        db_column='id_plantacion',
        related_name='mediciones',
    )

    class Meta:
        db_table = 'medicion'

    def __str__(self):
        return f'Medición {self.id_medicion}'

class ArbolMedido(models.Model):
    id_arbol_medido = models.AutoField(primary_key=True, db_column='id_arbol_medido')
    numero_arbol = models.SmallIntegerField(db_column='numero_arbol')
    dap_cm = models.FloatField(db_column='dap_cm')
    height_m = models.FloatField(db_column='height_m')
    basal_area = models.FloatField(db_column='basal_area')
    volumen_total_cc = models.FloatField(db_column='volumen_total_cc')
    volumen_total_sc = models.FloatField(db_column='volumen_total_sc')
    volumen_maderable_cc = models.FloatField(db_column='volumen_maderable_cc')
    volumen_maderable_sc = models.FloatField(db_column='volumen_maderable_sc')
    biomasa_aerea_total = models.FloatField(db_column='biomasa_aerea_total')
    biomasa_raiz = models.FloatField(db_column='biomasa_raiz')
    biomasa_total = models.FloatField(db_column='biomasa_total')

    plantacion = models.ForeignKey(
        Plantacion,
        on_delete=models.CASCADE,
        db_column='id_plantacion',
        related_name='arboles_medidos',
    )
    medicion = models.ForeignKey(
        Medicion,
        on_delete=models.CASCADE,
        db_column='id_medicion',
        related_name='arboles',
    )

    class Meta:
        db_table = 'arbol_medido'

    def __str__(self):
        return f'Árbol {self.numero_arbol} (medición {self.medicion_id})'

