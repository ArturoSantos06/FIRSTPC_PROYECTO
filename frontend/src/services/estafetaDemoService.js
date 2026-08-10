const DEMO_ORIGIN_POSTAL_CODE = '24000';

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const normalizePostalCode = (postalCode) => String(postalCode || '').replace(/\D/g, '').slice(0, 5);

const getZone = (postalCode) => {
  const normalized = Number(normalizePostalCode(postalCode) || DEMO_ORIGIN_POSTAL_CODE);
  if (normalized >= 10000 && normalized < 20000) return 'centro';
  if (normalized >= 20000 && normalized < 50000) return 'sureste';
  if (normalized >= 50000 && normalized < 70000) return 'occidente';
  return 'norte';
};

export const getShippingDemoQuote = async ({ carrierId = 'estafeta', postalCode, packages = 1 } = {}) => {
  await wait(250);
  const zone = getZone(postalCode);
  const carrier = carrierId === 'dhl'
    ? { name: 'DHL Terrestre', prefix: 'DHL', rates: { centro: 199, sureste: 249, occidente: 299, norte: 399 }, days: { centro: [2, 3], sureste: [2, 4], occidente: [3, 5], norte: [3, 6] } }
    : { name: 'Estafeta Terrestre', prefix: 'EST', rates: { centro: 119, sureste: 133, occidente: 159, norte: 189 }, days: { centro: [2, 4], sureste: [3, 5], occidente: [3, 6], norte: [4, 7] } };
  const zoneRates = carrier.rates;
  const zoneDays = carrier.days;
  const [minDays, maxDays] = zoneDays[zone];

  return {
    provider: `${carrierId}-demo`,
    carrier: carrier.name,
    carrierId,
    service: 'Terrestre',
    price: zoneRates[zone] + Math.max(0, Number(packages) - 1) * 35,
    currency: 'MXN',
    estimatedDays: { min: minDays, max: maxDays },
    originPostalCode: DEMO_ORIGIN_POSTAL_CODE,
    destinationPostalCode: normalizePostalCode(postalCode),
    isDemo: true,
  };
};

export const getEstafetaDemoQuote = (params) => getShippingDemoQuote({ ...params, carrierId: 'estafeta' });

export const createDemoShipment = async ({ carrierId = 'estafeta', orderNumber, address, shippingCost }) => {
  await wait(350);
  const prefix = carrierId === 'dhl' ? 'DHL' : 'EST';
  const trackingNumber = `${prefix}-DEMO-${String(orderNumber || Date.now()).replace(/[^A-Z0-9]/gi, '').slice(-12).toUpperCase()}`;

  return {
    provider: `${carrierId}-demo`,
    carrierId,
    trackingNumber,
    labelStatus: 'En preparación',
    status: 'preparacion',
    demoStartedAt: new Date().toISOString(),
    destinationPostalCode: normalizePostalCode(address?.postalCode),
    chargedAmount: Number(shippingCost) || 0,
    isDemo: true,
  };
};

export const createEstafetaDemoShipment = (params) => createDemoShipment({ ...params, carrierId: 'estafeta' });
