export const MAX_CART_QUANTITY = 99;

export const getLocalStock = (product) => Math.max(0, Number(product?.stock) || 0);

export const isDistributorIntegrated = (product) => Boolean(
  product?.distributorSku
  || product?.sku_distribuidor
  || product?.integrable
  || product?.isIntegrable
  || product?.dropshippingEnabled
  || product?.dropshipEnabled,
);

export const getMaxQuantity = (product) => (
  isDistributorIntegrated(product) ? MAX_CART_QUANTITY : Math.max(1, getLocalStock(product))
);

export const canAddToCart = (product) => isDistributorIntegrated(product) || getLocalStock(product) > 0;

export const normalizeQuantity = (value, product) => {
  const parsedValue = Number.parseInt(value, 10);
  const maxQuantity = getMaxQuantity(product);

  if (!Number.isFinite(parsedValue)) return 1;
  return Math.min(Math.max(parsedValue, 1), maxQuantity);
};

export const getFulfillment = (product, quantity) => {
  const localStock = getLocalStock(product);
  const requestedQuantity = Math.max(1, Number(quantity) || 1);
  const localQuantity = Math.min(requestedQuantity, localStock);

  return {
    localStock,
    localQuantity,
    distributorQuantity: Math.max(0, requestedQuantity - localStock),
    isDropship: isDistributorIntegrated(product) && requestedQuantity > localStock,
  };
};
