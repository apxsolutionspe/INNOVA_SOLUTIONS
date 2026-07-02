# Manual de usuario

## Login

Ingresar con el usuario administrador inicial. Si las credenciales son incorrectas, el sistema muestra un mensaje de error y no permite acceder al panel.

## Dashboard

Muestra indicadores operativos: ventas, ingresos, caja, stock critico, ordenes tecnicas, compras, servicios rapidos, utilidad estimada y alertas.

## Clientes

Permite listar, buscar, crear, editar, ver detalle y desactivar clientes. Los documentos no deben duplicarse.

## Inventario

Permite gestionar categorias, productos, stock minimo, ajustes de stock, movimientos y productos en stock bajo.

## POS y ventas

Permite buscar productos, agregarlos al carrito, seleccionar cliente, registrar pago y confirmar ventas. Requiere caja abierta. El stock se descuenta automaticamente.

## Historial de ventas

Permite revisar ventas, ver detalle, comprobante y anular ventas como ADMIN. Al anular, el stock se restaura.

## Ordenes tecnicas

Permite registrar equipos recibidos, cambiar estados, agregar diagnostico, repuestos, bitacora, comprobante y entrega del equipo.

## Caja

Permite abrir caja, registrar ingresos/gastos, ver movimientos, vender con caja abierta y cerrar caja con diferencia calculada.

## Servicios rapidos

Permite registrar impresiones, copias, tramites digitales, recargas y otros servicios. Se integra con caja.

## Compras y proveedores

Permite crear proveedores, registrar ordenes de compra, recibir productos, aumentar stock y registrar gasto de caja si la compra fue pagada.

## Reportes

Permite filtrar por fechas, visualizar graficos gerenciales y exportar reportes de ventas, inventario y caja en PDF o Excel.

## Rentabilidad

Muestra ingresos, costos, gastos, utilidad estimada, margen y ranking de productos/servicios mas rentables.

## Usuarios y configuracion

Solo ADMIN puede crear usuarios, cambiar roles, activar/desactivar cuentas, cambiar contrasenas y editar datos del negocio.

## Auditoria y notificaciones

Auditoria registra acciones criticas. Notificaciones muestra alertas internas como stock bajo, compras pendientes y ordenes listas.

## Uso desde celular

El sistema adapta sidebar, header, tablas, tarjetas y modales para pantallas pequenas. En movil se muestra una barra inferior con accesos rapidos a Dashboard, POS, Ordenes, Caja y Mas.

## Menu movil

La opcion `Mas` abre accesos a Clientes, Inventario, Servicios rapidos, Compras, Reportes y Configuracion. Las opciones administrativas se muestran segun el rol del usuario.

## Instalacion como app

Desde Chrome, Edge o Safari se puede agregar Innova Solutions a la pantalla de inicio. Para una instalacion correcta se recomienda usar el sistema desde el build de produccion.

## Notificaciones

La campana del encabezado muestra alertas internas y contador de no leidas. El sistema actualiza notificaciones periodicamente cuando la pestana esta activa.

## Modo sin conexion

Si no hay conexion se muestra un banner de aviso. Se permite consultar informacion reciente cacheada, pero ventas, caja, compras, stock y anulaciones quedan bloqueadas hasta recuperar internet.
