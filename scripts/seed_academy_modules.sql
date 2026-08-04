-- Seed data: the 7 syllabus sections as Web3 Academy modules.
-- Run this after 003_academy_tables.sql. Safe to re-run (ON CONFLICT DO NOTHING
-- would need a unique constraint on syllabus_topic if re-run protection matters —
-- for now this is a one-time seed, intended to run once per environment).

INSERT INTO academy_modules (title, description, syllabus_topic, order_index, pass_mark_percent) VALUES
('Introduction to Decentralized Finance', 'Blockchain fundamentals: definitions, types, properties, consensus mechanisms, and real-world uses.', '1. Introduction to Decentralized Finance', 1, 70),
('Introduction to Crypto & DeFi', 'Cryptocurrency definitions, history, types, and the general concept of DeFi.', '2. Introduction to Crypto & DeFi', 2, 70),
('Utilizing DeFi Tools', 'Decentralized applications, decentralized exchanges, staking, liquidity pools, and yield farming.', '3. Utilizing DeFi Tools', 3, 70),
('DeFi Securities', 'The Dos and Don''ts of DeFi — staying safe in a permissionless environment.', '4. DeFi Securities (DOs and DON''Ts of DEFI)', 4, 70),
('Research Methodology', 'How to research protocols, tokens, and projects before engaging with them.', '5. Research Methodology', 5, 70),
('DeFi Opportunities', 'Risk management in DeFi, and career/job opportunities in the space.', '6. DeFi Opportunities', 6, 70),
('Bonus Training', 'Degen trading, airdrops, and NFTs.', '7. Bonus Training', 7, 70);

-- Example lesson stubs per module (title only — content to be filled in by instructors
-- via the CMS/API once built, or directly in Supabase for now).

INSERT INTO academy_lessons (module_id, title, order_index)
SELECT id, 'Definition of Blockchain', 1 FROM academy_modules WHERE order_index = 1
UNION ALL SELECT id, 'Types of Blockchain', 2 FROM academy_modules WHERE order_index = 1
UNION ALL SELECT id, 'Properties of Blockchain', 3 FROM academy_modules WHERE order_index = 1
UNION ALL SELECT id, 'Blockchain Consensus Mechanisms', 4 FROM academy_modules WHERE order_index = 1
UNION ALL SELECT id, 'Uses of Blockchain', 5 FROM academy_modules WHERE order_index = 1

UNION ALL SELECT id, 'Definition of Cryptocurrencies', 1 FROM academy_modules WHERE order_index = 2
UNION ALL SELECT id, 'History of Cryptocurrencies', 2 FROM academy_modules WHERE order_index = 2
UNION ALL SELECT id, 'Types of Cryptocurrencies', 3 FROM academy_modules WHERE order_index = 2
UNION ALL SELECT id, 'Definition of Decentralized Finance', 4 FROM academy_modules WHERE order_index = 2
UNION ALL SELECT id, 'The General Concept of DeFi', 5 FROM academy_modules WHERE order_index = 2

UNION ALL SELECT id, 'Decentralized Applications', 1 FROM academy_modules WHERE order_index = 3
UNION ALL SELECT id, 'Decentralized Exchanges', 2 FROM academy_modules WHERE order_index = 3
UNION ALL SELECT id, 'Staking, Liquidity Pools and Yield Farming', 3 FROM academy_modules WHERE order_index = 3

UNION ALL SELECT id, 'DOs and DON''Ts of DeFi', 1 FROM academy_modules WHERE order_index = 4

UNION ALL SELECT id, 'How to Research a Protocol or Token', 1 FROM academy_modules WHERE order_index = 5

UNION ALL SELECT id, 'Risk Management in DeFi', 1 FROM academy_modules WHERE order_index = 6
UNION ALL SELECT id, 'Jobs in DeFi', 2 FROM academy_modules WHERE order_index = 6

UNION ALL SELECT id, 'Degen Trading', 1 FROM academy_modules WHERE order_index = 7
UNION ALL SELECT id, 'Airdrops', 2 FROM academy_modules WHERE order_index = 7
UNION ALL SELECT id, 'NFTs', 3 FROM academy_modules WHERE order_index = 7;
