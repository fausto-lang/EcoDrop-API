# usuarios/views.py

from django.shortcuts import render, redirect, get_object_or_404
from .models import Usuario


def usuarios(request):
    usuarios = Usuario.objects.all()

    return render(
        request,
        'usuarios/lista.html',
        {'usuarios': usuarios}
    )


def crear_usuario(request):
    if request.method == 'POST':
        Usuario.objects.create(
            nombre=request.POST.get('nombre'),
            total_reciclado=request.POST.get('total_reciclado')
        )

        return redirect('usuarios')

    return render(request, 'usuarios/crear.html')


def editar_usuario(request, id):
    usuario = get_object_or_404(Usuario, id=id)

    if request.method == 'POST':
        usuario.nombre = request.POST.get('nombre')
        usuario.total_reciclado = request.POST.get('total_reciclado')
        usuario.save()

        return redirect('usuarios')

    return render(
        request,
        'usuarios/editar.html',
        {'usuario': usuario}
    )


def eliminar_usuario(request, id):
    usuario = get_object_or_404(Usuario, id=id)

    if request.method == 'POST':
        usuario.delete()
        return redirect('usuarios')

    return render(
        request,
        'usuarios/eliminar.html',
        {'usuario': usuario}
    )
