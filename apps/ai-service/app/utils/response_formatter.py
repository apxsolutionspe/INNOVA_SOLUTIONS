from typing import Any


def as_list(value: Any) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        return [str(item) for item in value if item]
    return [str(value)]


def fallback_recommendations(question: str, insights: list[str]) -> list[str]:
    joined = f"{question} {' '.join(insights)}".lower()
    if "stock" in joined or "reponer" in joined:
        return [
            "Prioriza productos sin stock o por debajo del minimo.",
            "Revisa proveedores activos antes de crear compras.",
            "Evita vender productos sin disponibilidad confirmada.",
        ]
    if "rentabilidad" in joined or "ganancia" in joined:
        return [
            "Revisa costos de compra y precios de venta con bajo margen.",
            "Controla gastos de caja que reduzcan utilidad neta.",
            "Promueve productos y servicios con mejor margen estimado.",
        ]
    if "venta" in joined:
        return [
            "Refuerza inventario de productos con mayor rotacion.",
            "Compara metodos de pago y ticket promedio del periodo.",
            "Usa combos o promociones con productos de margen positivo.",
        ]
    return ["Revisa primero alertas de stock, caja, compras pendientes y ordenes tecnicas."]
