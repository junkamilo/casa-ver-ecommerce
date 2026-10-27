-- Envíos y geografía: 100 % del POS (md/COMPARACION-TABLAS-PRECIO-ENVIOS-Y-CIUDADES-POS-vs-WEB.md, fase 4).
--
-- El POS es la única fuente de las tarifas (shipping.rates), el envío gratis (shipping.config, con su
-- interruptor free_shipping_active) y la cobertura por municipio con códigos DANE (core.countries,
-- core.departments, core.municipalities). La web cotiza el envío con GET /api/public/shipping/quote y llena
-- los selectores de dirección con GET /api/public/geography/**. Estas tablas eran una copia que la web
-- refrescaba con el aviso shipping.upserted; ya nadie las lee. Los pedidos guardan su propia foto del envío
-- (orders.shippingCost, shippingRateName, shippingCity, shippingDepartment).

DROP TABLE IF EXISTS "shipping_configs";
DROP TABLE IF EXISTS "municipalities";
DROP TABLE IF EXISTS "departments";
DROP TABLE IF EXISTS "countries";
DROP TABLE IF EXISTS "shipping_rates";
