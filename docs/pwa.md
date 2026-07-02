# PWA y experiencia movil

Innova Solutions esta preparado como Progressive Web App para uso desde navegador de escritorio y dispositivos moviles compatibles.

## Instalacion en navegador

1. Ejecutar el frontend en modo produccion o preview.
2. Abrir la URL del sistema.
3. En Chrome, Edge o navegador compatible, usar la opcion `Instalar aplicacion`.
4. Confirmar la instalacion para abrir Innova Solutions como aplicacion independiente.

## Instalacion en celular

En Android, abrir el sistema desde Chrome y seleccionar `Agregar a pantalla principal` o `Instalar app`.

En iOS, abrir desde Safari, tocar compartir y seleccionar `Agregar a pantalla de inicio`.

## Funciones disponibles sin conexion

El modo offline es solo de consulta basica y depende de informacion consultada previamente:

- Pantalla base de la aplicacion.
- Assets estaticos, estilos e iconos.
- Clientes consultados recientemente.
- Productos consultados recientemente.
- Ordenes tecnicas consultadas recientemente.

## Funciones bloqueadas sin conexion

Por seguridad operativa, estas acciones requieren conexion:

- Registrar ventas.
- Abrir, cerrar o mover caja.
- Crear compras.
- Cambiar stock.
- Anular ventas.
- Registrar servicios rapidos.
- Cambiar estados de ordenes tecnicas.

## Seguridad

- No se cachean contrasenas.
- No se cachean tokens desde el service worker.
- No se cachean respuestas criticas de ventas, caja, compras o movimientos financieros.
- Las credenciales privadas deben mantenerse solo en el backend.

## Comandos utiles

```bash
npm.cmd run build:frontend
cd apps/frontend
npm.cmd run preview
```

La PWA se valida mejor sobre el build de produccion, porque el service worker no se activa en desarrollo.
