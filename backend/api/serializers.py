from rest_framework import serializers
from .models import(
    Rol,
    Usuario,
    Sector,
    Programa,
    MetaSanitaria,
    Indicador,
    PlantillaRemMapeo,
    ArchivosRem,
    ValoresExtraidos,
    CumplimientoMensual,
    Registros
)

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = "__all__"

class UsuarioSerializer(serializers.ModelSerializer):
    rol_detalle = RolSerializer(source="rol", read_only=True)

    class Meta:
        model = Usuario
        fields = [
            "id_usuario",
            "rut",
            "nombres",
            "apellidos",
            "correo",
            "estado",
            "rol",
            "rol_detalle"
            ]
        extra_kwargs = {
            "password_hash": {"write_only":True} #esto para evitar exponer la clave en el JSON
        }

class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = "__all__"

class ProgramaSerializer(serializers.ModelSerializer):
    jefe_programa = UsuarioSerializer(source="usuario", read_only=True)

    class Meta:
        model = Programa
        fields = [
            "id_programa",
            "nombre_programa",
            "codigo_programa",
            "usuario",
            "jefe_programa"
        ]

class MetaSanitariaSerializer(serializers.ModelSerializer):
    class Meta:
        model=MetaSanitaria
        fields="__all__"

class IndicadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Indicador
        fields = "__all__"

class PlantillaRemMapeoSerializer(serializers.ModelSerializer):
    class Meta:
        model= PlantillaRemMapeo
        fields= "__all__"

class ArchivosRemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchivosRem
        fields = "__all__"

class ValoresExtraidosSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValoresExtraidos
        fields = "__all__"

class CumplimientoMensualSerializer(serializers.ModelSerializer):
    indicador_detalle = IndicadorSerializer(source="indicador", read_only=True)
    sector_detalle = SectorSerializer(source = "sector", read_only=True)

    class Meta:
        model = CumplimientoMensual
        fields = [
            "id_cumplimiento",
            "periodo_mes",
            "periodo_year",
            "numerador",
            "denominador",
            "porcentaje_calculado",
            "estado_umbral",
            "indicador",
            "indicador_detalle",
            "sector",
            "sector_detalle"
        ]

class RegistrosSerializer(serializers.ModelSerializer):
    usuario_detalle = UsuarioSerializer(source="usuario", read_only=True)

    class Meta:
        model = Registros
        fields = [
            "id_registro",
            "accion",
            "rol_usuario",
            "tabla_afectada",
            "valor_anterior",
            "valor_nuevo",
            "fecha_hora",
            "ip_origen",
            "usuario",
            "usuario_detalle"
        ]