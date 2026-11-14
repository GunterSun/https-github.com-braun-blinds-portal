"""Proposal-only migration rehearsal on synthetic, in-memory data."""
import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class OrderRelationProposalTest(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        for path in sorted((ROOT / 'drizzle').glob('*.sql')):
            self.db.executescript(path.read_text())
        self.db.executescript("""
          INSERT INTO app_users(id,email,password_hash,password_salt,role)
            VALUES(1,'owner@example.invalid','synthetic','synthetic','owner');
          INSERT INTO customers(id,email) VALUES(1,'a@example.invalid'),(2,'b@example.invalid');
          INSERT INTO orders(id,order_number,customer_id) VALUES(1,'00001',1),(2,'00002',2),(3,'00003',1);
          INSERT INTO order_items(id,order_id,product_type) VALUES(1,1,'blind'),(2,2,'blind'),(3,3,'blind');
          INSERT INTO measure_properties(id,customer_id,name,created_by) VALUES(1,1,'A',1),(2,2,'B',1);
          INSERT INTO measure_rooms(id,property_id,name) VALUES(1,1,'Room'),(2,2,'Room');
          INSERT INTO measure_windows(id,property_id,room_id,code) VALUES(1,1,1,'W1'),(2,2,2,'W2');
          INSERT INTO measurement_versions(id,window_id,version,product_type,created_by)
            VALUES(1,1,1,'blind',1),(2,2,1,'blind',1);
        """)
        self.before = self.snapshot()
        self.db.executescript((ROOT / 'docs/v5/proposals/order-relations.sql').read_text())

    def tearDown(self):
        self.db.close()

    def snapshot(self):
        names = [r[0] for r in self.db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'v5_%' ORDER BY name")]
        return {name: self.db.execute(f'SELECT * FROM "{name}" ORDER BY rowid').fetchall() for name in names}

    def link(self, order=1, item=1, window=1, measurement=1):
        self.db.execute('INSERT INTO v5_order_window_links(order_id,order_item_id,window_id,measurement_version_id,created_by) VALUES(?,?,?,?,1)', (order,item,window,measurement))

    def source(self, source_id='7', order=1):
        self.db.execute("INSERT INTO v5_order_sources(source_system,source_entity,source_id,order_id,reviewed_by,review_reason) VALUES('legacy_portal','customer_orders',?,?,1,'Explicit fixture review')", (source_id,order))

    def test_preserves_all_existing_records_and_integrity(self):
        self.assertEqual(self.before, self.snapshot())
        self.assertEqual(self.db.execute('PRAGMA integrity_check').fetchone()[0], 'ok')
        self.assertEqual(self.db.execute('PRAGMA foreign_key_check').fetchall(), [])

    def test_same_window_can_have_a_later_order(self):
        self.link()
        self.link(order=3,item=3)
        self.assertEqual(self.db.execute('SELECT count(*) FROM v5_order_window_links').fetchone()[0], 2)

    def test_cross_customer_or_cross_order_or_wrong_measurement_rejected(self):
        for args in [(1,2,1,1),(1,1,2,2),(1,1,1,2),(1,1,999,1)]:
            with self.subTest(args=args), self.assertRaises(sqlite3.IntegrityError):
                self.link(*args)

    def test_source_cannot_map_to_two_orders_or_missing_order(self):
        self.source()
        with self.assertRaises(sqlite3.IntegrityError): self.source(order=3)
        with self.assertRaises(sqlite3.IntegrityError): self.source('8',999)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute('UPDATE v5_order_sources SET order_id=3')

    def test_window_line_cannot_be_silently_reassigned(self):
        self.link()
        with self.assertRaises(sqlite3.IntegrityError): self.link()
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute('UPDATE v5_order_window_links SET window_id=2')

    def test_document_types_are_namespaced_and_each_document_has_one_order(self):
        sql = "INSERT INTO v5_order_document_links(order_id,document_type,document_id,linked_by,link_reason) VALUES(?,?,7,1,'Fixture only')"
        self.db.execute(sql,(1,'customer_quote_version'))
        self.db.execute(sql,(1,'legacy_invoice_version'))
        with self.assertRaises(sqlite3.IntegrityError): self.db.execute(sql,(3,'customer_quote_version'))
        with self.assertRaises(sqlite3.IntegrityError): self.db.execute(sql,(1,'unknown'))
        # Document existence itself remains a future typed-service check.

    def test_audit_event_requires_valid_json_and_unique_retry_key(self):
        sql = "INSERT INTO v5_order_relation_events(order_id,actor_id,action,reason,before_json,after_json,idempotency_key) VALUES(1,1,'link','Fixture',?,?,?)"
        self.db.execute(sql,('{}','{"linked":true}','fixture-key-000001'))
        with self.assertRaises(sqlite3.IntegrityError): self.db.execute(sql,('{}','{}','fixture-key-000001'))
        with self.assertRaises(sqlite3.IntegrityError): self.db.execute(sql,('invalid','{}','fixture-key-000002'))

    def test_referenced_order_cannot_be_deleted(self):
        self.source()
        with self.assertRaises(sqlite3.IntegrityError): self.db.execute('DELETE FROM orders WHERE id=1')


if __name__ == '__main__':
    unittest.main()
