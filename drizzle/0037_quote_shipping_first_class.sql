ALTER TABLE `customer_quote_versions` ADD COLUMN `shipping_fee` real DEFAULT 0 NOT NULL;
UPDATE `customer_quote_versions`
SET `shipping_fee` = COALESCE((
  SELECT `amount`
  FROM `customer_quote_shipping`
  WHERE `customer_quote_shipping`.`quote_version_id` = `customer_quote_versions`.`id`
), 0);
CREATE TRIGGER `customer_quote_shipping_insert_sync`
AFTER INSERT ON `customer_quote_shipping`
BEGIN
  UPDATE `customer_quote_versions` SET `shipping_fee` = NEW.`amount` WHERE `id` = NEW.`quote_version_id`;
END;
CREATE TRIGGER `customer_quote_shipping_update_sync`
AFTER UPDATE OF `amount` ON `customer_quote_shipping`
BEGIN
  UPDATE `customer_quote_versions` SET `shipping_fee` = NEW.`amount` WHERE `id` = NEW.`quote_version_id`;
END;
