const endpoint_distribuidor =
  import.meta.env.VITE_DISTRIBUTOR_API_URL ||
  'https://us-central1-genesis-hardware.cloudfunctions.net/pedidos_dropship';

const leer_respuesta = async (respuesta) => {
  const texto_respuesta = await respuesta.text();

  console.log(
    'Respuesta del distribuidor:',
    respuesta.status,
    texto_respuesta,
  );

  let datos_respuesta = {};

  try {
    datos_respuesta = texto_respuesta
      ? JSON.parse(texto_respuesta)
      : {};
  } catch {
    datos_respuesta = {
      respuesta: texto_respuesta,
    };
  }

  if (!respuesta.ok) {
    throw new Error(
      `ERROR_DISTRIBUIDOR:${respuesta.status}:${texto_respuesta}`,
    );
  }

  return datos_respuesta;
};

export async function enviarOrdenDropshipping(
  items_dropship = [],
  direccion_entrega = {},
) {
  const items = items_dropship.map((item) => ({
    sku_distribuidor: item.distributorSku,
    nombre_producto: item.nombre || item.name || item.productName,
    cantidad: Number(item.quantity),
  }));

  if (!items.length) {
    throw new Error('El pedido no contiene productos');
  }

  if (items.some((item) => !item.sku_distribuidor || item.cantidad <= 0)) {
    throw new Error('Los productos del pedido son inválidos');
  }

  const datos_pedido = {
    items,
    direccion_entrega: {
      nombre: `${direccion_entrega.firstName || ''} ${direccion_entrega.lastName || ''}`.trim() || 'Cliente Final',
      calle: `${direccion_entrega.street || ''} ${direccion_entrega.exteriorNumber || ''}`.trim() || 'Dirección no provista',
      ciudad: direccion_entrega.city || 'Campeche',
      codigo_postal: direccion_entrega.postalCode || '24000',
    },
  };

  console.log(
    'Payload enviado:',
    JSON.stringify(datos_pedido, null, 2),
  );

  const respuesta = await fetch(endpoint_distribuidor, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos_pedido),
  });

  return leer_respuesta(respuesta);
}
