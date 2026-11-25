import math
import os
import re
from dotenv import load_dotenv
from pathlib import Path


env_path = Path(__file__).resolve().parent.parent / 'server' / '.env'
load_dotenv(env_path)

class FormulaEvaluator:
    """Evalúa fórmulas simples desde .env"""
    
    def __init__(self):
        self.formulas = {
            'basal_area': os.getenv('FORMULA_BASAL_AREA'),
            'diametro_altura_pecho': os.getenv('FORMULA_DIAMETRO_ALTURA_PECHO'),
            'volumen_total_cc': os.getenv('FORMULA_VOLUMEN_TOTAL_CC'),
            'volumen_total_sc': os.getenv('FORMULA_VOLUMEN_TOTAL_SC'),
            'volumen_maderable_cc': os.getenv('FORMULA_VOLUMEN_MADERABLE_CC'),
            'volumen_maderable_sc': os.getenv('FORMULA_VOLUMEN_MADERABLE_SC'),
            'biomasa_aerea_total': os.getenv('FORMULA_BIOMASA_AEREA_TOTAL'),
            'biomasa_raiz': os.getenv('FORMULA_BIOMASA_RAIZ'),
            'biomasa_total': os.getenv('FORMULA_BIOMASA_TOTAL'),
            'tamano_parcela': os.getenv('FORMULA_TAMANO_PARCELA'),
            'radio_parcela': os.getenv('FORMULA_RADIO_PARCELA'),
            'arboles_ha': os.getenv('FORMULA_ARBOLES_HA'),
            'por_ha': os.getenv('FORMULA_POR_HA'),
            'biomasa_ha': os.getenv('FORMULA_BIOMASA_HA'),
            'captacion_bosque': os.getenv('FORMULA_CAPTACION_BOSQUE'),
            'dias': os.getenv('FORMULA_DIAS'),
            'indice_sitio': os.getenv('FORMULA_INDICE_SITIO'),
            'captacion_diaria': os.getenv('FORMULA_CAPTACION_DIARIA'),
            'emision_diaria': os.getenv('FORMULA_EMISION_DIARIA'),
            'punto_equilibrio': os.getenv('FORMULA_PUNTO_EQUILIBRIO'),
}
    
    def obtener_variables(self, nombre_formula):
        """Extrae variables de una fórmula"""
        formula = self.formulas.get(nombre_formula)
        if not formula:
            return []
        
        variables = re.findall(r'[a-zA-Z_]\w*', formula)
        palabras_clave = {'math', 'pi', 'e', 'sin', 'cos', 'tan', 'log', 'sqrt', 'exp'}
        return list(dict.fromkeys([v for v in variables if v not in palabras_clave]))
    
    def evaluar(self, nombre_formula, valores):
        """Evalúa una fórmula con los valores dados"""
        formula = self.formulas.get(nombre_formula)
        
        if not formula:
            raise ValueError(f"Fórmula '{nombre_formula}' no encontrada")
        
        variables_necesarias = self.obtener_variables(nombre_formula)
        
        for var in variables_necesarias:
            if var not in valores:
                raise ValueError(f"Falta la variable '{var}'")
        
        try:
            contexto = {
                'math': math,
                '__builtins__': {}
            }
            contexto.update(valores)
            return eval(formula, contexto)
        except Exception as e:
            raise ValueError(f"Error al evaluar: {str(e)}")


# Instancia global
formula_eval = FormulaEvaluator()