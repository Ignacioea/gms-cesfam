from django.shortcuts import render
from rest_framework import viewsets, mixins
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

from .serializers import (
    RolSerializer,
    UsuarioSerializer,
    SectorSerializer,
    ProgramaSerializer,
    MetaSanitariaSerializer,
    IndicadorSerializer,
    PlantillaRemMapeoSerializer,
    ArchivosRemSerializer,
    ValoresExtraidosSerializer,
    CumplimientoMensualSerializer,
    RegistrosSerializer
)

# Create your views here.

class RolViewSet(viewsets.Model):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

class UsuarioViewSet(viewsets.Model):
    queryset = Usuario.objects.all().select_related("id_rol")
    serializer_class = UsuarioSerializer
    
class SectorViewSet(viewsets.Model):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer

class ProgramaViewSet(viewsets.Model):
    queryset = Programa.objects.all().select_related("id_usuario")
    serializer_class = ProgramaSerializer

class MetaSanitariaViewSet(viewsets.Model):
    queryset = MetaSanitaria.objects.all().select_related("id_programa")
    serializer_class = MetaSanitariaSerializer

class IndicadorViewSet(viewsets.Model):
    queryset = Indicador.objects.all().select_related("id_meta")
    serializer_class = IndicadorSerializer

class PlantillaRemMapeoViewSet(viewsets.Model):
    queryset = PlantillaRemMapeo.objects.all().select_related("id_indicador")
    serializer_class = PlantillaRemMapeoSerializer

class ArchivosRemViewSet(viewsets.Model):
    queryset = ArchivosRem.objects.all().select_related("id_usuario")
    serializer_class = ArchivosRemSerializer

class ValoresExtraidosViewSet(viewsets.Model):
    queryset = ValoresExtraidos.objects.all().select_related("id_archivo", "id_mapeo", "id_sector")
    serializer_class = ValoresExtraidosSerializer

class CumplimientoMensualViewSet(viewsets.Model):
    queryset = CumplimientoMensual.objects.all().select_related("id_indicador", "id_sector")
    serializer_class = CumplimientoMensualSerializer

class RegistrosViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
    ):
    queryset = Registros.objects.all().order_by("-fecha_hora").select_related("id_usuario")
    serializer_class = RegistrosSerializer