// app.js - Jin Park (CWF) Pricing Engine & Order System (NO DISCOUNT VERSION)

// 1. Embedded Databases (Self-contained for offline use)
const COMPACT_MATERIALS_DB = [
  [
    "AA-01B",
    "Aspen Allure",
    "Aspen Allure",
    "",
    "B",
    "",
    "",
    "DTW0283-14K",
    false
  ],
  [
    "AA-02B",
    "Aspen Allure",
    "Aspen Allure",
    "",
    "B",
    "",
    "",
    "DTW0283-17K",
    false
  ],
  [
    "AA-03B",
    "Aspen Allure",
    "Aspen Allure",
    "",
    "B",
    "",
    "",
    "DTW0283-18K",
    false
  ],
  [
    "AA-04B",
    "Aspen Allure",
    "Aspen Allure",
    "",
    "B",
    "",
    "",
    "DTW0283-16K",
    false
  ],
  [
    "AA-05B",
    "Aspen Allure",
    "Aspen Allure",
    "",
    "B",
    "",
    "",
    "DTW0283-24K",
    false
  ],
  [
    "ASAW04K",
    "ASpen Allure",
    "ASpen Allure",
    "",
    "B",
    "110\"",
    "280g/m²",
    "DTW0283-16K",
    false
  ],
  [
    "ASAW05K",
    "ASpen Allure",
    "ASpen Allure",
    "",
    "B",
    "110\"",
    "280g/m²",
    "DTW0283-24K",
    false
  ],
  [
    "ASEW01K",
    "ASpen Allure",
    "ASpen Allure",
    "",
    "B",
    "110\"",
    "200g/m²",
    "DTW0283-14K",
    false
  ],
  [
    "ASEW02K",
    "ASpen Allure",
    "ASpen Allure",
    "",
    "B",
    "110\"",
    "280g/m²",
    "DTW0283-17K",
    false
  ],
  [
    "ASHW03K",
    "ASpen Allure",
    "ASpen Allure",
    "",
    "B",
    "110\"",
    "280g/m²",
    "DTW0283-18K",
    false
  ],
  [
    "CBAW07K",
    "Coastal Breeze",
    "Coastal Breeze",
    "",
    "B",
    "112\"",
    "287g/m²",
    "DTW0281-35K",
    false
  ],
  [
    "CBEW06K",
    "Coastal Breeze",
    "Coastal Breeze",
    "",
    "B",
    "112\"",
    "287g/m²",
    "DTW0281-24K",
    false
  ],
  [
    "CBHW05K",
    "Coastal Breeze",
    "Coastal Breeze",
    "",
    "B",
    "112\"",
    "287g/m²",
    "DTW0281-23K",
    false
  ],
  [
    "CBLW02K",
    "Coastal Breeze",
    "Coastal Breeze",
    "",
    "B",
    "112\"",
    "287g/m²",
    "DTW0281-33K",
    false
  ],
  [
    "CBLW03K",
    "Coastal Breeze",
    "Coastal Breeze",
    "",
    "B",
    "112\"",
    "287g/m²",
    "DTW0281-32K",
    false
  ],
  [
    "CBLW04K",
    "Coastal Breeze",
    "Coastal Breeze",
    "",
    "B",
    "112\"",
    "287g/m²",
    "DTW0281-29K",
    false
  ],
  [
    "CBMW08K",
    "Coastal Breeze",
    "Coastal Breeze",
    "",
    "B",
    "112\"",
    "287g/m²",
    "DTW0281-26K",
    false
  ],
  [
    "CBNW09K",
    "Coastal Breeze",
    "Coastal Breeze",
    "",
    "B",
    "112\"",
    "287g/m²",
    "DTW0281-22K",
    false
  ],
  [
    "CBWW01K",
    "Coastal Breeze",
    "Coastal Breeze",
    "",
    "B",
    "112\"",
    "287g/m²",
    "DTW0281-13K",
    false
  ],
  [
    "CC-01C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG328-2M",
    false
  ],
  [
    "CC-02C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG326-21M",
    false
  ],
  [
    "CC-03C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG331-2M",
    false
  ],
  [
    "CC-04C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG331-3M",
    false
  ],
  [
    "CC-05C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTC423-7M",
    false
  ],
  [
    "CC-06C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG327-10M",
    false
  ],
  [
    "CC-07C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG638-3M",
    false
  ],
  [
    "CC-08C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG638-2M",
    false
  ],
  [
    "CC-09C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG387-7M",
    false
  ],
  [
    "CC-10C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG388-6M",
    false
  ],
  [
    "CC-11C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG387-8M",
    false
  ],
  [
    "CC-12C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG387-9M",
    false
  ],
  [
    "CC-13C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG387-4M",
    false
  ],
  [
    "CC-14C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG201-23M",
    false
  ],
  [
    "CC-15C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG638-5M",
    false
  ],
  [
    "CC-16C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG331-5M",
    false
  ],
  [
    "CC-17C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG331-9M",
    false
  ],
  [
    "CC-18C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG298-21M",
    false
  ],
  [
    "CC-19C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTC423-21M",
    false
  ],
  [
    "CC-20C",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "DTG331-8M",
    false
  ],
  [
    "CCAC08K",
    "Chic Charm",
    "Chic Charm",
    "",
    "B",
    "114\"",
    "203g/㎡",
    "",
    false
  ],
  [
    "CCAC09K",
    "Chic Charm",
    "Chic Charm",
    "",
    "B",
    "114\"",
    "238g/㎡",
    "",
    false
  ],
  [
    "CCAW07K",
    "Chic Charm",
    "Chic Charm",
    "",
    "B",
    "110\"",
    "265g/m²",
    "",
    false
  ],
  [
    "CCAW10K",
    "Chic Charm",
    "Chic Charm",
    "",
    "B",
    "110\"",
    "349g/㎡",
    "",
    false
  ],
  [
    "CCEC01K",
    "Chic Charm",
    "Chic Charm",
    "",
    "B",
    "114\"",
    "255g/㎡",
    "",
    false
  ],
  [
    "CCEC02K",
    "Chic Charm",
    "Chic Charm",
    "",
    "B",
    "114\"",
    "203g/㎡",
    "",
    false
  ],
  [
    "CCEW03K",
    "Chic Charm",
    "Chic Charm",
    "",
    "B",
    "110\"",
    "265g/m²",
    "",
    false
  ],
  [
    "CCHC06K",
    "Chic Charm",
    "Chic Charm",
    "",
    "B",
    "114\"",
    "251g/m²",
    "",
    false
  ],
  [
    "CCLC04K",
    "Chic Charm",
    "Chic Charm",
    "",
    "B",
    "114\"",
    "227g/㎡",
    "",
    false
  ],
  [
    "CCLW05K",
    "Chic Charm",
    "Chic Charm",
    "",
    "B",
    "110\"",
    "349g/㎡",
    "",
    false
  ],
  [
    "CMAC11K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "C",
    "114\"",
    "255g/m²",
    "DTC237-5M",
    false
  ],
  [
    "CMAW05K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "B",
    "110\"",
    "110g/m²",
    "DTW0282-10K",
    false
  ],
  [
    "CMAW06K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "B",
    "110\"",
    "110g/m²",
    "DTW0282-19K",
    false
  ],
  [
    "CMEW01K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "B",
    "110\"",
    "110g/m²",
    "DTW0282-14K",
    false
  ],
  [
    "CMHC08K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "C",
    "114\"",
    "255g/m²",
    "DTC237-3M",
    false
  ],
  [
    "CMHW09K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "B",
    "110\"",
    "274g/m²",
    "DTW926-340K",
    false
  ],
  [
    "CMHW10K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "B",
    "110\"",
    "274g/m²",
    "DTW3613-5K",
    false
  ],
  [
    "CMMW02K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "B",
    "110\"",
    "110g/m²",
    "DTW0282-22K",
    false
  ],
  [
    "CMMW04K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "B",
    "110\"",
    "110g/m²",
    "DTW0282-24K",
    false
  ],
  [
    "CMSW03K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "B",
    "110\"",
    "110g/m²",
    "DTW0282-23K",
    false
  ],
  [
    "CMWW07K",
    "Coastal CharM",
    "Coastal CharM",
    "",
    "B",
    "110\"",
    "268g/m²",
    "DTW4427-5K",
    false
  ],
  [
    "CR-01C",
    "Canyon Ridge",
    "Canyon Ridge",
    "",
    "C",
    "",
    "",
    "DTW028-712M",
    false
  ],
  [
    "CR-02C",
    "Canyon Ridge",
    "Canyon Ridge",
    "",
    "C",
    "",
    "",
    "DTW028-715M",
    false
  ],
  [
    "CR-03C",
    "Canyon Ridge",
    "Canyon Ridge",
    "",
    "C",
    "",
    "",
    "DTW028-714M",
    false
  ],
  [
    "CT-01B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG375-2K",
    false
  ],
  [
    "CT-02B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTB012-2K",
    false
  ],
  [
    "CT-03B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTB012-3K",
    false
  ],
  [
    "CT-04B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG365-7K",
    false
  ],
  [
    "CT-05B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG386-4K",
    false
  ],
  [
    "CT-06B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG370-2K",
    false
  ],
  [
    "CT-07B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG382-6K",
    false
  ],
  [
    "CT-08B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG389-5K",
    false
  ],
  [
    "CT-09B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG268-7K",
    false
  ],
  [
    "CT-10B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG373-2K",
    false
  ],
  [
    "CT-11B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG382-2K",
    false
  ],
  [
    "CT-12B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG386-2K",
    false
  ],
  [
    "CT-13B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG392-2K",
    false
  ],
  [
    "CT-14B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG302-4K",
    false
  ],
  [
    "CT-15B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG386-8K",
    false
  ],
  [
    "CT-16B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG370-3K",
    false
  ],
  [
    "CT-17B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG370-6K",
    false
  ],
  [
    "CT-18B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG382-4K",
    false
  ],
  [
    "CT-19B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG370-7K",
    false
  ],
  [
    "CT-20B",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "DTG370-4K",
    false
  ],
  [
    "CTAG08M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "112\"",
    "375g/m²",
    "DTG638-2M",
    false
  ],
  [
    "CTAG10M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "425g/m²",
    "DTG388-6M",
    false
  ],
  [
    "CTAG14M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "116\"",
    "390g/m²",
    "DTG201-23M",
    false
  ],
  [
    "CTAG15M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "112\"",
    "375g/m²",
    "DTG638-5M",
    false
  ],
  [
    "CTBG12M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "453g/m²",
    "DTG387-9M",
    false
  ],
  [
    "CTBG20M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "385g/m²",
    "DTG331-8M",
    false
  ],
  [
    "CTEG01M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "410g/m²",
    "DTG328-2M",
    false
  ],
  [
    "CTFC05M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "418g/m²",
    "DTC423-7M",
    false
  ],
  [
    "CTFG04M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "385g/m²",
    "DTG331-3M",
    false
  ],
  [
    "CTFG06M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "500g/m²",
    "DTG327-10M",
    false
  ],
  [
    "CTFG07M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "112\"",
    "375g/m²",
    "DTG638-3M",
    false
  ],
  [
    "CTFG09M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "453g/m²",
    "DTG387-7M",
    false
  ],
  [
    "CTFG16M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "385g/m²",
    "DTG331-5M",
    false
  ],
  [
    "CTFG17M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "385g/m²",
    "DTG331-9M",
    false
  ],
  [
    "CTGG18M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "116\"",
    "473g/m²",
    "DTG298-21M",
    false
  ],
  [
    "CTHG02M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "454g/m²",
    "DTG326-21M",
    false
  ],
  [
    "CTHG03M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "385g/m²",
    "DTG331-2M",
    false
  ],
  [
    "CTKG13M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "453g/m²",
    "DTG387-4M",
    false
  ],
  [
    "CTSG11M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "110\"",
    "453g/m²",
    "DTG387-8M",
    false
  ],
  [
    "CTYC19M",
    "Cosy ComforT",
    "Cosy ComforT",
    "",
    "C",
    "114\"",
    "404g/m²",
    "DTC423-21M",
    false
  ],
  [
    "DTB012-2K",
    "Chloe",
    "RCH-01",
    "Winter Light",
    "B",
    "110\"",
    "450g/m²",
    "",
    false
  ],
  [
    "DTB012-3K",
    "Chloe",
    "RCH-02",
    "Soft Cream",
    "B",
    "110\"",
    "450g/m²",
    "",
    false
  ],
  [
    "DTB026-21K",
    "Sevilla",
    "RSE-01",
    "Tranquil Oasis",
    "B",
    "110\"",
    "421g/m²",
    "",
    false
  ],
  [
    "DTB026-2K",
    "Sevilla",
    "RSE-02",
    "Ivory Silk",
    "B",
    "110\"",
    "420g/m²",
    "",
    false
  ],
  [
    "DTB026-6K",
    "Sevilla",
    "RSE-03",
    "Blushing Apricot",
    "B",
    "112\"",
    "414g/m²",
    "",
    false
  ],
  [
    "DTB026-8K",
    "Sevilla",
    "RSE-04",
    "Rustic Harvest",
    "B",
    "110\"",
    "421g/m²",
    "",
    false
  ],
  [
    "DTB0631-2K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-07B",
    false
  ],
  [
    "DTB0631-5K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-08B",
    false
  ],
  [
    "DTB2149-10H",
    "Sophie",
    "RSO-01",
    "Serene Horizon",
    "A",
    "110\"",
    "286g/m²",
    "",
    false
  ],
  [
    "DTB2149-31H",
    "Sophie",
    "RSO-02",
    "Desert Mirage",
    "A",
    "110\"",
    "286g/m²",
    "",
    false
  ],
  [
    "DTB2149-8H",
    "Sophie",
    "RSO-03",
    "Golden Ember",
    "A",
    "110\"",
    "286g/m²",
    "",
    false
  ],
  [
    "DTB270-23H",
    "Zara",
    "RZA-01",
    "Frosted Snow",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTB270-26H",
    "Zara",
    "RZA-02",
    "Gentle Drift",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTB270-28H",
    "Zara",
    "RZA-03",
    "Dusky Fog",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTB270-33H",
    "Zara",
    "RZA-04",
    "Golden Dune",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTB270-34H",
    "Zara",
    "RZA-05",
    "Burnished Clay",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTB270-37H",
    "Zara",
    "RZA-06",
    "Midnight Shadow",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTB270-38H",
    "Zara",
    "RZA-07",
    "Lagoon Whisper",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTB270-39H",
    "Zara",
    "RZA-08",
    "Summit Sky",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTB270-43H",
    "Zara",
    "RZA-09",
    "Velvet Merlot",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTB270-6H",
    "Zara",
    "RZA-10",
    "Urban Slate",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTB9027-6K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-01B",
    false
  ],
  [
    "DTB9027-7K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-06B",
    false
  ],
  [
    "DTB9934-2K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-02B",
    false
  ],
  [
    "DTB9934-3K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-03B",
    false
  ],
  [
    "DTB9934-5K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-05B",
    false
  ],
  [
    "DTC218-8M",
    "Grace",
    "RGA-01",
    "Ethereal Cream",
    "C",
    "114\"",
    "255g/㎡",
    "",
    false
  ],
  [
    "DTC219-2M",
    "Aspen",
    "RAS-01",
    "Soft Sand",
    "C",
    "114\"",
    "251g/m²",
    "",
    false
  ],
  [
    "DTC229-8M",
    "Paige",
    "RPA-01",
    "Sunlit Taupe",
    "C",
    "114\"",
    "227g/㎡",
    "",
    false
  ],
  [
    "DTC237-3M",
    "Lyla",
    "RLY-01",
    "Golden Drift",
    "C",
    "114\"",
    "255g/㎡",
    "",
    false
  ],
  [
    "DTC237-5M",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "OM-11B",
    false
  ],
  [
    "DTC323-6M",
    "Giselle",
    "RGI-01",
    "Morning Mist",
    "C",
    "114\"",
    "203g/㎡",
    "",
    false
  ],
  [
    "DTC324-2M",
    "Clara",
    "RCL-01",
    "Ivory Whisper",
    "C",
    "114\"",
    "203g/㎡",
    "",
    false
  ],
  [
    "DTC338-3M",
    "Hazel",
    "RHA-01",
    "Storm Cloud",
    "C",
    "114\"",
    "238g/㎡",
    "",
    false
  ],
  [
    "DTC417-3M",
    "Ivy",
    "RIV-01",
    "Pure Snow",
    "C",
    "116\"",
    "373g/m²",
    "",
    false
  ],
  [
    "DTC419-8M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "UE-04C",
    false
  ],
  [
    "DTC422-21M",
    "Ameila",
    "RAM-01",
    "Alpine White",
    "C",
    "116\"",
    "300g/m²",
    "",
    false
  ],
  [
    "DTC423-21M",
    "Mia",
    "RMI-01",
    "Golden Glow",
    "C",
    "114\"",
    "404g/m²",
    "",
    false
  ],
  [
    "DTC423-7M",
    "Pansy",
    "RPS-01",
    "Warm Taupe",
    "C",
    "110\"",
    "418g/m²",
    "",
    false
  ],
  [
    "DTC439-3M",
    "Rhea",
    "RRH-01",
    "Crystal Clear",
    "C",
    "116\"",
    "336g/m²",
    "",
    false
  ],
  [
    "DTC439-4M",
    "Rhea",
    "RRH-02",
    "Gentle Beige",
    "C",
    "114\"",
    "341g/m²",
    "",
    false
  ],
  [
    "DTC439-5M",
    "Rhea",
    "RRH-03",
    "Soft Ivory",
    "C",
    "116\"",
    "336g/m²",
    "",
    false
  ],
  [
    "DTE12-2K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "UC-09B",
    false
  ],
  [
    "DTE16-2K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "UC-08B",
    false
  ],
  [
    "DTE18-2M",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "UC-01B",
    false
  ],
  [
    "DTG164-2K",
    "Apex",
    "RAP-01",
    "Whispering White",
    "B",
    "116\"",
    "275g/m²",
    "",
    false
  ],
  [
    "DTG164-5K",
    "Apex",
    "RAP-02",
    "Natural Linen",
    "B",
    "116\"",
    "275g/m²",
    "",
    false
  ],
  [
    "DTG183-2K",
    "Reverie",
    "RRE-01",
    "Pale Drift",
    "B",
    "116\"",
    "285g/m²",
    "",
    false
  ],
  [
    "DTG200-21K",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "GC-10B",
    false
  ],
  [
    "DTG201-23M",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "CC-14C",
    false
  ],
  [
    "DTG204-6K",
    "Zenith",
    "RZE-01",
    "Desert Sand",
    "C",
    "116\"",
    "315g/m²",
    "",
    false
  ],
  [
    "DTG212-26K",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "GC-13B",
    false
  ],
  [
    "DTG212-4K",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "GC-08B",
    false
  ],
  [
    "DTG212-6K",
    "Cosmo",
    "RCO-03",
    "Frosted Taupe",
    "B",
    "116\"",
    "285g/m²",
    "",
    false
  ],
  [
    "DTG224-5K",
    "Carmel",
    "RCA-01",
    "Classic Linen",
    "C",
    "116\"",
    "265g/m²",
    "",
    false
  ],
  [
    "DTG230-21K",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "HC-18B",
    false
  ],
  [
    "DTG268-7K",
    "Aria",
    "RAR-01",
    "Creamy Almond",
    "B",
    "116\"",
    "330g/m²",
    "",
    false
  ],
  [
    "DTG274-4K",
    "Freya",
    "RFR-01",
    "Glistening Sand",
    "C",
    "116\"",
    "270g/m²",
    "",
    false
  ],
  [
    "DTG276-2K",
    "Freya",
    "RFR-02",
    "Ivory Silk",
    "C",
    "116\"",
    "300g/m²",
    "",
    false
  ],
  [
    "DTG277-5K",
    "Freya",
    "RFR-03",
    "Gilded Toast",
    "C",
    "116\"",
    "290g/m²",
    "",
    false
  ],
  [
    "DTG291-5K",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "GC-12B",
    false
  ],
  [
    "DTG298-21M",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "CC-18C",
    false
  ],
  [
    "DTG302-4K",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "CT-14B",
    false
  ],
  [
    "DTG303-8K",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "HC-17B",
    false
  ],
  [
    "DTG304-4K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "UC-11B",
    false
  ],
  [
    "DTG306-2K",
    "Nebula",
    "RNE-01",
    "Snowy Ivory",
    "B",
    "116\"",
    "400g/m²",
    "",
    false
  ],
  [
    "DTG306-3K",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "HC-11B",
    false
  ],
  [
    "DTG306-4K",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "HC-05B",
    false
  ],
  [
    "DTG306-6K",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "HC-15B",
    false
  ],
  [
    "DTG326-21M",
    "Hearth",
    "RHE-01",
    "Soft Beige",
    "C",
    "110\"",
    "454g/m²",
    "",
    false
  ],
  [
    "DTG327-10M",
    "Ember",
    "REM-01",
    "Natural Sand",
    "C",
    "110\"",
    "500g/m²",
    "",
    false
  ],
  [
    "DTG328-2M",
    "Haven",
    "RHV-01",
    "Classic Ivory",
    "C",
    "110\"",
    "410g/m²",
    "",
    false
  ],
  [
    "DTG331-2M",
    "Nestle",
    "RNS-01",
    "Soft Caramel",
    "C",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "DTG331-3M",
    "Nestle",
    "RNS-02",
    "Earthy Taupe",
    "C",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "DTG331-5M",
    "Nestle",
    "RNS-03",
    "Woodland Bark",
    "C",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "DTG331-8M",
    "Nestle",
    "RNS-04",
    "Deep Tide Blue",
    "C",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "DTG331-9M",
    "Nestle",
    "RNS-05",
    "Iron Gate",
    "C",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "DTG365-2K",
    "Solitude",
    "RSL-01",
    "Sand Dune",
    "C",
    "110\"",
    "382g/m²",
    "",
    false
  ],
  [
    "DTG365-3K",
    "Solitude",
    "RSL-02",
    "Slate Storm",
    "C",
    "116\"",
    "382g/m²",
    "",
    false
  ],
  [
    "DTG365-4K",
    "Solitude",
    "RSL-03",
    "Metalic Pewter",
    "C",
    "116\"",
    "382g/m²",
    "",
    false
  ],
  [
    "DTG365-5K",
    "Solitude",
    "RSL-04",
    "Silver Mist",
    "C",
    "116\"",
    "382g/m²",
    "",
    false
  ],
  [
    "DTG365-7K",
    "Solitude",
    "RSL-05",
    "Ivory Lace",
    "C",
    "110\"",
    "382g/m²",
    "",
    false
  ],
  [
    "DTG367-5K",
    "Hush",
    "RHU-01",
    "Sandy Beige",
    "B",
    "116\"",
    "251g/m²",
    "",
    false
  ],
  [
    "DTG369-2K",
    "Mellow",
    "RME-01",
    "Meadow Green",
    "C",
    "116\"",
    "330g/m²",
    "",
    false
  ],
  [
    "DTG369-4K",
    "Mellow",
    "RME-02",
    "Creamy Beige",
    "C",
    "116\"",
    "330g/m²",
    "",
    false
  ],
  [
    "DTG369-5K",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "HC-07B",
    false
  ],
  [
    "DTG369-6K",
    "Mellow",
    "RME-04",
    "Warm Taupe",
    "C",
    "116\"",
    "330g/m²",
    "",
    false
  ],
  [
    "DTG370-2K",
    "Maplewood",
    "RMA-01",
    "Butter Cream",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTG370-3K",
    "Maplewood",
    "RMA-02",
    "Stone Path",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTG370-4K",
    "Maplewood",
    "RMA-03",
    "Sunset Orange",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTG370-6K",
    "Maplewood",
    "RMA-04",
    "Ashen Charcoal",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTG370-7K",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "CT-19B",
    false
  ],
  [
    "DTG371-3K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "UC-10B",
    false
  ],
  [
    "DTG373-2K",
    "Sunnybrook",
    "RSU-01",
    "Toasted Almond",
    "B",
    "110\"",
    "377g/m²",
    "",
    false
  ],
  [
    "DTG373-4K",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "HC-16B",
    false
  ],
  [
    "DTG375-2K",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "CT-01B",
    false
  ],
  [
    "DTG375-3K",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "HC-09B",
    false
  ],
  [
    "DTG375-4K",
    "Emberglow",
    "RGL-03",
    "Obsidian Silver",
    "C",
    "116\"",
    "302g/m²",
    "",
    false
  ],
  [
    "DTG382-2K",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "CT-11B",
    false
  ],
  [
    "DTG382-4K",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "CT-18B",
    false
  ],
  [
    "DTG382-6K",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "CT-07B",
    false
  ],
  [
    "DTG384-7K",
    "Theodora",
    "RTH-01",
    "Dove Grey",
    "C",
    "110\"",
    "336g/m²",
    "",
    false
  ],
  [
    "DTG386-2K",
    "Dahlia",
    "RDA-01",
    "Rustic Clay",
    "B",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "DTG386-4K",
    "Dahlia",
    "RDA-02",
    "Soft Almond",
    "B",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "DTG386-8K",
    "Dahlia",
    "RDA-03",
    "Shadow Mist",
    "B",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "DTG387-4M",
    "Hazel",
    "RHZ-01",
    "Onyx Shimmer",
    "C",
    "110\"",
    "453g/m²",
    "",
    false
  ],
  [
    "DTG387-7M",
    "Hazel",
    "RHZ-02",
    "Warm Sand",
    "C",
    "110\"",
    "453g/m²",
    "",
    false
  ],
  [
    "DTG387-8M",
    "Hazel",
    "RHZ-03",
    "Ocean Fog",
    "C",
    "110\"",
    "453g/m²",
    "",
    false
  ],
  [
    "DTG387-9M",
    "Cosy Comfort",
    "Cosy Comfort",
    "",
    "C",
    "",
    "",
    "CC-12C",
    false
  ],
  [
    "DTG388-6M",
    "Harrison",
    "RRG-01",
    "Repose Grey",
    "C",
    "110\"",
    "425g/m²",
    "",
    false
  ],
  [
    "DTG389-5K",
    "Evelyn",
    "REV-01",
    "Creamy Drift",
    "C",
    "110\"",
    "321g/m²",
    "",
    false
  ],
  [
    "DTG392-2K",
    "Coastal Threads",
    "Coastal Threads",
    "",
    "B",
    "",
    "",
    "CT-13B",
    false
  ],
  [
    "DTG638-2M",
    "Corsica",
    "RCS-01",
    "Cozy Slate",
    "C",
    "112\"",
    "375g/m²",
    "",
    false
  ],
  [
    "DTG638-3M",
    "Corsica",
    "RCS-02",
    "Pebble Taupe",
    "C",
    "112\"",
    "375g/m²",
    "",
    false
  ],
  [
    "DTG638-5M",
    "Corsica",
    "RCS-03",
    "Steel Grey",
    "C",
    "112\"",
    "375g/m²",
    "",
    false
  ],
  [
    "DTS177-15H",
    "Sheer 1-2",
    "SH1-2",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS179-25H",
    "Sheer 1-3",
    "SH1-3",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS179-38H",
    "Sheer 1-4",
    "SH1-4",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS191-18K",
    "Sheer 1-1",
    "SH1-1",
    "",
    "B",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS191-38H",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "SB-09A",
    true
  ],
  [
    "DTS291-22H",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "SB-10A",
    true
  ],
  [
    "DTS312-05K",
    "Sheer 2-3",
    "SH2-3",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "DTS312-06K",
    "Sheer 2-2",
    "SH2-2",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "DTS312-52K",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "SH-13B",
    true
  ],
  [
    "DTS312-55K",
    "Sheer 2-4",
    "SH2-4",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "DTS312-58K",
    "Sheer 2-5",
    "SH2-5",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "DTS312-59K",
    "Sheer 2-6",
    "SH2-6",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "DTS312-71K",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "SH-09B",
    true
  ],
  [
    "DTS312-75K",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "SH-12B",
    true
  ],
  [
    "DTS312-89K",
    "Sheer 2-9",
    "SH2-9",
    "",
    "B",
    "112\"",
    "",
    "",
    true
  ],
  [
    "DTS312-8K",
    "Sheer 2-10",
    "SH2-10",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "DTS534-10H",
    "Sheer 3-1",
    "SH3-1",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS534-35K",
    "Sheer 3-2",
    "SH3-2",
    "",
    "B",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS534-37H",
    "Sheer 3-3",
    "SH3-3",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS534-48H",
    "Sheer 3-4",
    "SH3-4",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS534-50K",
    "Sheer 3-5",
    "SH3-5",
    "",
    "B",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS534-52H",
    "Sheer 3-6",
    "SH3-6",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS534-53K",
    "Sheer 3-7",
    "SH3-7",
    "",
    "B",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS534-54H",
    "Sheer 3-8",
    "SH3-8",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS534-57K",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "SH-16B",
    true
  ],
  [
    "DTS534-61K",
    "Sheer 3-10",
    "SH3-10",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS534-62K",
    "Sheer 3-11",
    "SH3-11",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTS534-63H",
    "Sheer 3-12",
    "SH3-12",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "DTW0220-12M",
    "Tranquil",
    "RTR-01",
    "Pure Snow",
    "C",
    "110\"",
    "339g/m²",
    "",
    false
  ],
  [
    "DTW0270-12N",
    "Santana",
    "RSA-01",
    "Ivory Snow",
    "D",
    "112\"",
    "280g/m²",
    "",
    false
  ],
  [
    "DTW0270-13N",
    "Santana",
    "RSA-02",
    "Ivory Silk",
    "D",
    "112\"",
    "280g/m²",
    "",
    false
  ],
  [
    "DTW0270-14N",
    "Santana",
    "RSA-03",
    "Natural Linen",
    "D",
    "112\"",
    "280g/m²",
    "",
    false
  ],
  [
    "DTW0270-17N",
    "Liberty Linen",
    "Liberty Linen",
    "",
    "D",
    "",
    "",
    "/",
    false
  ],
  [
    "DTW028-316K",
    "Provence",
    "RPR-01",
    "Earthy Taupe",
    "C",
    "110\"",
    "439g/m²",
    "",
    false
  ],
  [
    "DTW028-317K",
    "Provence",
    "RPR-02",
    "Cozy Pebble",
    "C",
    "110\"",
    "439g/m²",
    "",
    false
  ],
  [
    "DTW028-320K",
    "Provence",
    "RPR-03",
    "Soft Drift Grey",
    "C",
    "110\"",
    "510g/m²",
    "",
    false
  ],
  [
    "DTW028-610N",
    "Provence",
    "RPR-04",
    "Moonlight Grey",
    "C",
    "112\"",
    "526g/m²",
    "",
    false
  ],
  [
    "DTW028-612N",
    "Provence",
    "RPR-05",
    "Pure Whisper",
    "C",
    "112\"",
    "526g/m²",
    "",
    false
  ],
  [
    "DTW028-616N",
    "Provence",
    "RPR-06",
    "Ivory Cream",
    "C",
    "112\"",
    "526g/m²",
    "",
    false
  ],
  [
    "DTW028-712M",
    "Provence",
    "RPR-07",
    "Butter Glow",
    "C",
    "112\"",
    "452g/m²",
    "",
    false
  ],
  [
    "DTW028-714M",
    "Provence",
    "RPR-08",
    "Granite Stone",
    "C",
    "112\"",
    "452g/m²",
    "",
    false
  ],
  [
    "DTW028-715M",
    "Provence",
    "RPR-09",
    "Soft Sand",
    "C",
    "112\"",
    "452g/m²",
    "",
    false
  ],
  [
    "DTW0281-13K",
    "Jasper",
    "RJS-01",
    "Winter Frost",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "DTW0281-22K",
    "Jasper",
    "RJS-02",
    "Blushing Rose",
    "A",
    "112\"",
    "288g/m²",
    "",
    false
  ],
  [
    "DTW0281-23K",
    "Jasper",
    "RJS-03",
    "Sunset Tan",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "DTW0281-24K",
    "Jasper",
    "RJS-04",
    "Soft Pearl",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "DTW0281-26K",
    "Jasper",
    "RJS-05",
    "Lagoon Breeze",
    "A",
    "112\"",
    "288g/m²",
    "",
    false
  ],
  [
    "DTW0281-29K",
    "Jasper",
    "RJS-06",
    "Ivory Lace",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "DTW0281-32K",
    "Jasper",
    "RJS-07",
    "Pale Mist",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "DTW0281-33K",
    "Jasper",
    "RJS-08",
    "Alpine White",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "DTW0281-35K",
    "Jasper",
    "RJS-09",
    "Silver Dawn",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "DTW0282-10K",
    "Ansel",
    "RAN-01",
    "Cloud Grey",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "DTW0282-14K",
    "Ansel",
    "RAN-02",
    "Golden Cream",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "DTW0282-19K",
    "Ansel",
    "RAN-03",
    "Twilight Mauve",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "DTW0282-22K",
    "Ansel",
    "RAN-04",
    "Mint Cream",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "DTW0282-23K",
    "Ansel",
    "RAN-05",
    "Seafoam Teal",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "DTW0282-24K",
    "Ansel",
    "RAN-06",
    "Deep Lagoon",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "DTW0283-14K",
    "Dorian",
    "RDO-01",
    "Crystal Snow",
    "C",
    "110\"",
    "200g/m²",
    "",
    false
  ],
  [
    "DTW0283-16K",
    "Dorian",
    "RDO-02",
    "Silken Mist",
    "C",
    "110\"",
    "280g/m²",
    "",
    false
  ],
  [
    "DTW0283-17K",
    "Dorian",
    "RDO-03",
    "Pale Sage Silver",
    "C",
    "110\"",
    "280g/m²",
    "",
    false
  ],
  [
    "DTW0283-18K",
    "Dorian",
    "RDO-04",
    "Soft Silver Fog",
    "C",
    "110\"",
    "280g/m²",
    "",
    false
  ],
  [
    "DTW0283-24K",
    "Dorian",
    "RDO-05",
    "Midnight Gleam",
    "C",
    "110\"",
    "280g/m²",
    "",
    false
  ],
  [
    "DTW141-2M",
    "Stellan",
    "RSN-01",
    "Ivory Snow",
    "C",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTW141-4M",
    "Stellan",
    "RSN-02",
    "Morning Silver",
    "C",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTW141-5M",
    "Stellan",
    "RSN-03",
    "Ivory Silk",
    "C",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTW141-6M",
    "Stellan",
    "RSN-04",
    "Charcoal Stone",
    "C",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTW141-7M",
    "Stellan",
    "RSN-05",
    "Earthy Walnut",
    "C",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "DTW3244-16M",
    "Soren",
    "ROR-01",
    "Glistening Slate",
    "C",
    "110\"",
    "410g/㎡",
    "",
    false
  ],
  [
    "DTW3613-5K",
    "Magnus",
    "RMG-01",
    "Golden Sand",
    "B",
    "110\"",
    "274g/㎡",
    "",
    false
  ],
  [
    "DTW4427-5K",
    "Lennox",
    "RLE-01",
    "Pure Frost",
    "B",
    "110\"",
    "268g/m²",
    "",
    false
  ],
  [
    "DTW926-340K",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "OM-09B",
    false
  ],
  [
    "DTW926-713K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-13B",
    false
  ],
  [
    "DTW926-721K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-16B",
    false
  ],
  [
    "DTW926-722K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-14B",
    false
  ],
  [
    "DTW926-726K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-15B",
    false
  ],
  [
    "DTW926-730K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-18B",
    false
  ],
  [
    "DTW926-734K",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "PP-17B",
    false
  ],
  [
    "FNA310K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "118\"",
    "",
    "DTS312-8K",
    false
  ],
  [
    "FNA311K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "118\"",
    "",
    "DTS312-55K",
    false
  ],
  [
    "FNA312K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "118\"",
    "",
    "DTS312-75K",
    false
  ],
  [
    "FNA313K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "118\"",
    "",
    "DTS312-52K",
    false
  ],
  [
    "FNA314K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "118\"",
    "",
    "DTS312-58K",
    false
  ],
  [
    "FNA315K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "118\"",
    "",
    "DTS312-05K",
    false
  ],
  [
    "FNE309K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "118\"",
    "",
    "DTS312-71K",
    false
  ],
  [
    "FNE506K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "110\"",
    "",
    "DTS534-61K",
    false
  ],
  [
    "FNE507K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "110\"",
    "",
    "DTS534-53K",
    false
  ],
  [
    "FNE508K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "110\"",
    "",
    "DTS534-62K",
    false
  ],
  [
    "FNF317K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "118\"",
    "",
    "DTS312-06K",
    false
  ],
  [
    "FNF516K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "110\"",
    "",
    "DTS534-57K",
    false
  ],
  [
    "FNW104K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "110\"",
    "",
    "DTS191-18K",
    false
  ],
  [
    "FNW303K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "112\"",
    "",
    "DTS312-89K",
    false
  ],
  [
    "FNW305K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "118\"",
    "",
    "DTS312-59K",
    false
  ],
  [
    "FNW501K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "110\"",
    "",
    "DTS534-50K",
    false
  ],
  [
    "FNW502K",
    "FusioN",
    "FusioN",
    "",
    "B",
    "110\"",
    "",
    "DTS534-35K",
    false
  ],
  [
    "GC-01B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG183-2K",
    false
  ],
  [
    "GC-02B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG164-2K",
    false
  ],
  [
    "GC-03B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG276-2K",
    false
  ],
  [
    "GC-04B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG212-6K",
    false
  ],
  [
    "GC-05B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG277-5K",
    false
  ],
  [
    "GC-06B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG367-5K",
    false
  ],
  [
    "GC-07B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG224-5K",
    false
  ],
  [
    "GC-08B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG212-4K",
    false
  ],
  [
    "GC-09B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG164-5K",
    false
  ],
  [
    "GC-10B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG200-21K",
    false
  ],
  [
    "GC-11B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG274-4K",
    false
  ],
  [
    "GC-12B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG291-5K",
    false
  ],
  [
    "GC-13B",
    "Golden Glamour",
    "Golden Glamour",
    "",
    "B",
    "",
    "",
    "DTG212-26K",
    false
  ],
  [
    "GG-01B",
    "Vivid",
    "RVI-01",
    "Faint Moonlight",
    "B",
    "116\"",
    "285g/m²",
    "",
    false
  ],
  [
    "GG-02B",
    "Twilight",
    "RTW-01",
    "Soft Whisper",
    "B",
    "116\"",
    "275g/m²",
    "",
    false
  ],
  [
    "GG-03B",
    "Moonstone",
    "RMO-01",
    "Almond Mist",
    "B",
    "116\"",
    "300g/m²",
    "",
    false
  ],
  [
    "GG-04B",
    "Twilight",
    "RTW-02",
    "Frosted Taupe",
    "B",
    "116\"",
    "285g/m²",
    "",
    false
  ],
  [
    "GG-05B",
    "Twilight",
    "RTW-03",
    "Gilded Toast",
    "B",
    "116\"",
    "290g/m²",
    "",
    false
  ],
  [
    "GG-06B",
    "Twilight",
    "RTW-04",
    "Warm Caramel",
    "B",
    "116\"",
    "251g/m²",
    "",
    false
  ],
  [
    "GG-07B",
    "Twilight",
    "RTW-05",
    "Maple Glow",
    "B",
    "116\"",
    "265g/m²",
    "",
    false
  ],
  [
    "GG-08B",
    "Twilight",
    "RTW-06",
    "Soft Bronze",
    "B",
    "116\"",
    "285g/m²",
    "",
    false
  ],
  [
    "GG-09B",
    "Twilight",
    "RTW-07",
    "Silken Chestnut",
    "B",
    "116\"",
    "275g/m²",
    "",
    false
  ],
  [
    "GG-10B",
    "Mirage",
    "RMI-01",
    "Glimmering Cocoa",
    "B",
    "116\"",
    "229g/m²",
    "",
    false
  ],
  [
    "GG-11B",
    "Vivid",
    "RVI-03",
    "Golden Sand",
    "B",
    "116\"",
    "270g/m²",
    "",
    false
  ],
  [
    "GG-13B",
    "Twilight",
    "RTW-08",
    "Silken Sand",
    "B",
    "116\"",
    "285g/m²",
    "",
    false
  ],
  [
    "GREG01K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "285g/m²",
    "DTG183-2K",
    false
  ],
  [
    "GREG02K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "275g/m²",
    "DTG164-2K",
    false
  ],
  [
    "GREG03K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "300g/m²",
    "DTG276-2K",
    false
  ],
  [
    "GRHG07K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "265g/m²",
    "DTG224-5K",
    false
  ],
  [
    "GRHG08K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "285g/m²",
    "DTG212-4K",
    false
  ],
  [
    "GRHG09K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "275g/m²",
    "DTG164-5K",
    false
  ],
  [
    "GRHG10K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "229g/m²",
    "DTG200-21K",
    false
  ],
  [
    "GRHG11K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "270g/m²",
    "DTG274-4K",
    false
  ],
  [
    "GRHG13K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "285g/m²",
    "DTG212-26K",
    false
  ],
  [
    "GRLG04K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "285g/m²",
    "DTG212-6K",
    false
  ],
  [
    "GRLG05K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "290g/m²",
    "DTG277-5K",
    false
  ],
  [
    "GRLG06K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "251g/m²",
    "DTG367-5K",
    false
  ],
  [
    "GRNG12K",
    "Golden GlamouR",
    "Golden GlamouR",
    "",
    "B",
    "116\"",
    "262g/m²",
    "DTG291-5K",
    false
  ],
  [
    "HC-01B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG306-2K",
    false
  ],
  [
    "HC-02B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG369-4K",
    false
  ],
  [
    "HC-03B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG365-2K",
    false
  ],
  [
    "HC-04B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG204-6K",
    false
  ],
  [
    "HC-05B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG306-4K",
    false
  ],
  [
    "HC-06B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG369-6K",
    false
  ],
  [
    "HC-07B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG369-5K",
    false
  ],
  [
    "HC-08B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG369-2K",
    false
  ],
  [
    "HC-09B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG375-3K",
    false
  ],
  [
    "HC-10B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG365-5K",
    false
  ],
  [
    "HC-11B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG306-3K",
    false
  ],
  [
    "HC-12B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG375-4K",
    false
  ],
  [
    "HC-13B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG365-4K",
    false
  ],
  [
    "HC-14B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG365-3K",
    false
  ],
  [
    "HC-15B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG306-6K",
    false
  ],
  [
    "HC-16B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG373-4K",
    false
  ],
  [
    "HC-17B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG303-8K",
    false
  ],
  [
    "HC-18B",
    "Horizon Cloth",
    "Horizon Cloth",
    "",
    "B",
    "",
    "",
    "DTG230-21K",
    false
  ],
  [
    "HNE110H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS291-22H",
    false
  ],
  [
    "HNE111H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS534-52H",
    false
  ],
  [
    "HNW101H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS177-15H",
    false
  ],
  [
    "HNW102H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS179-25H",
    false
  ],
  [
    "HNW103H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS534-54H",
    false
  ],
  [
    "HNW105H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS534-48H",
    false
  ],
  [
    "HNW108H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS179-38H",
    false
  ],
  [
    "HNW109H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS191-38H",
    false
  ],
  [
    "HNW504H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS534-10H",
    false
  ],
  [
    "HNW506H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS534-37H",
    false
  ],
  [
    "HNW507H",
    "HorizoN",
    "HorizoN",
    "",
    "A",
    "110\"",
    "",
    "DTS534-63H",
    false
  ],
  [
    "LL-01D",
    "Liberty Linen",
    "Liberty Linen",
    "",
    "D",
    "",
    "",
    "DTW0270-12N",
    false
  ],
  [
    "LL-02D",
    "Liberty Linen",
    "Liberty Linen",
    "",
    "D",
    "",
    "",
    "DTW0270-14N",
    false
  ],
  [
    "LL-03D",
    "Liberty Linen",
    "Liberty Linen",
    "",
    "D",
    "",
    "",
    "DTW0270-13N",
    false
  ],
  [
    "LNAW04N",
    "Liberty LineN",
    "Liberty LineN",
    "",
    "D",
    "112\"",
    "280g/m²",
    "DTW0270-17N",
    false
  ],
  [
    "LNEW03N",
    "Liberty LineN",
    "Liberty LineN",
    "",
    "D",
    "112\"",
    "280g/m²",
    "DTW0270-13N",
    false
  ],
  [
    "LNHW02N",
    "Liberty LineN",
    "Liberty LineN",
    "",
    "D",
    "112\"",
    "280g/m²",
    "DTW0270-14N",
    false
  ],
  [
    "LNWW01N",
    "Liberty LineN",
    "Liberty LineN",
    "",
    "D",
    "112\"",
    "280g/m²",
    "DTW0270-12N",
    false
  ],
  [
    "ML-01B",
    "Meadow Linen",
    "Meadow Linen",
    "",
    "B",
    "",
    "",
    "DTW0281-13K",
    false
  ],
  [
    "ML-02B",
    "Meadow Linen",
    "Meadow Linen",
    "",
    "B",
    "",
    "",
    "DTW0281-33K",
    false
  ],
  [
    "ML-03B",
    "Meadow Linen",
    "Meadow Linen",
    "",
    "B",
    "",
    "",
    "DTW0281-32K",
    false
  ],
  [
    "ML-04B",
    "Meadow Linen",
    "Meadow Linen",
    "",
    "B",
    "",
    "",
    "DTW0281-29K",
    false
  ],
  [
    "ML-05B",
    "Meadow Linen",
    "Meadow Linen",
    "",
    "B",
    "",
    "",
    "DTW0281-23K",
    false
  ],
  [
    "ML-06B",
    "Meadow Linen",
    "Meadow Linen",
    "",
    "B",
    "",
    "",
    "DTW0281-24K",
    false
  ],
  [
    "ML-07B",
    "Meadow Linen",
    "Meadow Linen",
    "",
    "B",
    "",
    "",
    "DTW0281-35K",
    false
  ],
  [
    "ML-08B",
    "Meadow Linen",
    "Meadow Linen",
    "",
    "B",
    "",
    "",
    "DTW0281-26K",
    false
  ],
  [
    "ML-09B",
    "Meadow Linen",
    "Meadow Linen",
    "",
    "B",
    "",
    "",
    "DTW0281-22K",
    false
  ],
  [
    "MS-01B",
    "Modern Serenity",
    "Modern Serenity",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "MS-02B",
    "Modern Serenity",
    "Modern Serenity",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "MS-03B",
    "Modern Serenity",
    "Modern Serenity",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "MS-04B",
    "Modern Serenity",
    "Modern Serenity",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "MS-05B",
    "Modern Serenity",
    "Modern Serenity",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "MS-06B",
    "Modern Serenity",
    "Modern Serenity",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "MS-07B",
    "Modern Serenity",
    "Modern Serenity",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "MS-08B",
    "Modern Serenity",
    "Modern Serenity",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "MS-09B",
    "Modern Serenity",
    "Modern Serenity",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "MS-10B",
    "Modern Serenity",
    "Modern Serenity",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "OM-01B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTW0282-14K",
    false
  ],
  [
    "OM-02B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTW0282-22K",
    false
  ],
  [
    "OM-03B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTW0282-23K",
    false
  ],
  [
    "OM-04B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTW0282-24K",
    false
  ],
  [
    "OM-05B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTW0282-10K",
    false
  ],
  [
    "OM-06B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTW0282-19K",
    false
  ],
  [
    "OM-07B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTW4427-5K",
    false
  ],
  [
    "OM-08B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTC237-3M",
    false
  ],
  [
    "OM-09B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTW926-340K",
    false
  ],
  [
    "OM-10B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTW3613-5K",
    false
  ],
  [
    "OM-11B",
    "Ocean Mist",
    "Ocean Mist",
    "",
    "B",
    "",
    "",
    "DTC237-5M",
    false
  ],
  [
    "OO-01D",
    "Organic Oasis",
    "Organic Oasis",
    "",
    "D",
    "",
    "",
    "DTW028-610N",
    false
  ],
  [
    "OO-02D",
    "Organic Oasis",
    "Organic Oasis",
    "",
    "D",
    "",
    "",
    "DTW028-616N",
    false
  ],
  [
    "OO-03D",
    "Organic Oasis",
    "Organic Oasis",
    "",
    "D",
    "",
    "",
    "DTW028-612N",
    false
  ],
  [
    "ORAW01N",
    "ORganic Oasis",
    "ORganic Oasis",
    "",
    "D",
    "112\"",
    "526g/m²",
    "DTW028-610N",
    false
  ],
  [
    "OREW03N",
    "ORganic Oasis",
    "ORganic Oasis",
    "",
    "D",
    "112\"",
    "526g/m²",
    "DTW028-612N",
    false
  ],
  [
    "ORHW02N",
    "ORganic Oasis",
    "ORganic Oasis",
    "",
    "D",
    "112\"",
    "526g/m²",
    "DTW028-616N",
    false
  ],
  [
    "PEAB08K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "326g/m²",
    "DTB0631-5K",
    false
  ],
  [
    "PEAG09K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "336g/m²",
    "DTG384-7K",
    false
  ],
  [
    "PEEB01K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "285g/m²",
    "DTB9027-6K",
    false
  ],
  [
    "PEEB02K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "363g/m²",
    "DTB9934-2K",
    false
  ],
  [
    "PEEB03K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "363g/m²",
    "DTB9934-3K",
    false
  ],
  [
    "PEEB04K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "420g/m²",
    "DTB026-2K",
    false
  ],
  [
    "PEGB10K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "421g/m²",
    "DTB026-21K",
    false
  ],
  [
    "PEGW17K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "411g/m²",
    "DTW926-734K",
    false
  ],
  [
    "PEMB06K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "285g/m²",
    "DTB9027-7K",
    false
  ],
  [
    "PEMB07K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "326g/m²",
    "DTB0631-2K",
    false
  ],
  [
    "PEMW15K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "396g/m²",
    "DTW926-726K",
    false
  ],
  [
    "PENB11K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "112\"",
    "414g/m²",
    "DTB026-6K",
    false
  ],
  [
    "PENW14K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "411g/m²",
    "DTW926-722K",
    false
  ],
  [
    "PERW18K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "411g/m²",
    "DTW926-730K",
    false
  ],
  [
    "PETB05K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "363g/m²",
    "DTB9934-5K",
    false
  ],
  [
    "PETB12K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "421g/m²",
    "DTB026-8K",
    false
  ],
  [
    "PEWW13K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "410g/m²",
    "DTW926-713K",
    false
  ],
  [
    "PEYW16K",
    "Provence PurE",
    "Provence PurE",
    "",
    "B",
    "110\"",
    "411g/m²",
    "DTW926-721K",
    false
  ],
  [
    "PP-01B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB9027-6K",
    false
  ],
  [
    "PP-02B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB9934-2K",
    false
  ],
  [
    "PP-03B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB9934-3K",
    false
  ],
  [
    "PP-04B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB026-2K",
    false
  ],
  [
    "PP-05B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB9934-5K",
    false
  ],
  [
    "PP-06B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB9027-7K",
    false
  ],
  [
    "PP-07B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB0631-2K",
    false
  ],
  [
    "PP-08B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB0631-5K",
    false
  ],
  [
    "PP-09B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTG384-7K",
    false
  ],
  [
    "PP-10B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB026-21K",
    false
  ],
  [
    "PP-11B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB026-6K",
    false
  ],
  [
    "PP-12B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTB026-8K",
    false
  ],
  [
    "PP-13B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTW926-713K",
    false
  ],
  [
    "PP-14B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTW926-722K",
    false
  ],
  [
    "PP-15B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTW926-726K",
    false
  ],
  [
    "PP-16B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTW926-721K",
    false
  ],
  [
    "PP-17B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTW926-734K",
    false
  ],
  [
    "PP-18B",
    "Provence Pure",
    "Provence Pure",
    "",
    "B",
    "",
    "",
    "DTW926-730K",
    false
  ],
  [
    "PREW01M",
    "PRairie Pride",
    "PRairie Pride",
    "",
    "C",
    "112\"",
    "452g/m²",
    "DTW028-712M",
    false
  ],
  [
    "PRHW02M",
    "PRairie Pride",
    "PRairie Pride",
    "",
    "C",
    "112\"",
    "452g/m²",
    "DTW028-715M",
    false
  ],
  [
    "PRHW03M",
    "PRairie Pride",
    "PRairie Pride",
    "",
    "C",
    "112\"",
    "452g/m²",
    "DTW028-714M",
    false
  ],
  [
    "RAM-01",
    "Ameila",
    "DTC422-21M",
    "Alpine White",
    "D",
    "116\"",
    "300g/m²",
    "",
    false
  ],
  [
    "RAN-01",
    "Ansel",
    "DTW0282-10K",
    "Cloud Grey",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "RAN-02",
    "Ansel",
    "DTW0282-14K",
    "Golden Cream",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "RAN-03",
    "Ansel",
    "DTW0282-19K",
    "Twilight Mauve",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "RAN-04",
    "Ansel",
    "DTW0282-22K",
    "Mint Cream",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "RAN-05",
    "Ansel",
    "DTW0282-23K",
    "Seafoam Teal",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "RAN-06",
    "Ansel",
    "DTW0282-24K",
    "Deep Lagoon",
    "D",
    "110\"",
    "110g/m²",
    "",
    false
  ],
  [
    "RAP-01",
    "Apex",
    "DTG164-2K",
    "Whispering White",
    "B",
    "116\"",
    "275g/m²",
    "",
    false
  ],
  [
    "RAP-02",
    "Apex",
    "DTG164-5K",
    "Natural Linen",
    "B",
    "116\"",
    "275g/m²",
    "",
    false
  ],
  [
    "RAR-01",
    "Aria",
    "DTG268-7K",
    "Creamy Almond",
    "B",
    "116\"",
    "330g/m²",
    "",
    false
  ],
  [
    "RAS-01",
    "Aspen",
    "DTC219-2M",
    "Soft Sand",
    "D",
    "114\"",
    "251g/m²",
    "",
    false
  ],
  [
    "RCA-01",
    "Carmel",
    "DTG224-5K",
    "Classic Linen",
    "C",
    "116\"",
    "265g/m²",
    "",
    false
  ],
  [
    "RCH-01",
    "Chloe",
    "DTB012-2K",
    "Winter Light",
    "B",
    "110\"",
    "450g/m²",
    "",
    false
  ],
  [
    "RCH-02",
    "Chloe",
    "DTB012-3K",
    "Soft Cream",
    "B",
    "110\"",
    "450g/m²",
    "",
    false
  ],
  [
    "RCL-01",
    "Clara",
    "DTC324-2M",
    "Ivory Whisper",
    "D",
    "114\"",
    "203g/㎡",
    "",
    false
  ],
  [
    "RCO-03",
    "Cosmo",
    "DTG212-6K",
    "Frosted Taupe",
    "B",
    "116\"",
    "285g/m²",
    "",
    false
  ],
  [
    "RCS-01",
    "Corsica",
    "DTG638-2M",
    "Cozy Slate",
    "D",
    "112\"",
    "375g/m²",
    "",
    false
  ],
  [
    "RCS-02",
    "Corsica",
    "DTG638-3M",
    "Pebble Taupe",
    "D",
    "112\"",
    "375g/m²",
    "",
    false
  ],
  [
    "RCS-03",
    "Corsica",
    "DTG638-5M",
    "Steel Grey",
    "D",
    "112\"",
    "375g/m²",
    "",
    false
  ],
  [
    "RDA-01",
    "Dahlia",
    "DTG386-2K",
    "Rustic Clay",
    "B",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "RDA-02",
    "Dahlia",
    "DTG386-4K",
    "Soft Almond",
    "B",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "RDA-03",
    "Dahlia",
    "DTG386-8K",
    "Shadow Mist",
    "B",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "RDO-01",
    "Dorian",
    "DTW0283-14K",
    "Crystal Snow",
    "C",
    "110\"",
    "200g/m²",
    "",
    false
  ],
  [
    "RDO-02",
    "Dorian",
    "DTW0283-16K",
    "Silken Mist",
    "C",
    "110\"",
    "280g/m²",
    "",
    false
  ],
  [
    "RDO-03",
    "Dorian",
    "DTW0283-17K",
    "Pale Sage Silver",
    "C",
    "110\"",
    "280g/m²",
    "",
    false
  ],
  [
    "RDO-04",
    "Dorian",
    "DTW0283-18K",
    "Soft Silver Fog",
    "C",
    "110\"",
    "280g/m²",
    "",
    false
  ],
  [
    "RDO-05",
    "Dorian",
    "DTW0283-24K",
    "Midnight Gleam",
    "C",
    "110\"",
    "280g/m²",
    "",
    false
  ],
  [
    "REM-01",
    "Ember",
    "DTG327-10M",
    "Natural Sand",
    "D",
    "110\"",
    "500g/m²",
    "",
    false
  ],
  [
    "REV-01",
    "Evelyn",
    "DTG389-5K",
    "Creamy Drift",
    "C",
    "110\"",
    "321g/m²",
    "",
    false
  ],
  [
    "RFR-01",
    "Freya",
    "DTG274-4K",
    "Glistening Sand",
    "C",
    "116\"",
    "270g/m²",
    "",
    false
  ],
  [
    "RFR-02",
    "Freya",
    "DTG276-2K",
    "Ivory Silk",
    "C",
    "116\"",
    "300g/m²",
    "",
    false
  ],
  [
    "RFR-03",
    "Freya",
    "DTG277-5K",
    "Gilded Toast",
    "C",
    "116\"",
    "290g/m²",
    "",
    false
  ],
  [
    "RGA-01",
    "Grace",
    "DTC218-8M",
    "Ethereal Cream",
    "D",
    "114\"",
    "255g/㎡",
    "",
    false
  ],
  [
    "RGI-01",
    "Giselle",
    "DTC323-6M",
    "Morning Mist",
    "C",
    "114\"",
    "203g/㎡",
    "",
    false
  ],
  [
    "RGL-03",
    "Emberglow",
    "DTG375-4K",
    "Obsidian Silver",
    "C",
    "116\"",
    "302g/m²",
    "",
    false
  ],
  [
    "RHA-01",
    "Hazel",
    "DTC338-3M",
    "Storm Cloud",
    "D",
    "114\"",
    "238g/㎡",
    "",
    false
  ],
  [
    "RHE-01",
    "Hearth",
    "DTG326-21M",
    "Soft Beige",
    "C",
    "110\"",
    "454g/m²",
    "",
    false
  ],
  [
    "RHU-01",
    "Hush",
    "DTG367-5K",
    "Sandy Beige",
    "B",
    "116\"",
    "251g/m²",
    "",
    false
  ],
  [
    "RHV-01",
    "Haven",
    "DTG328-2M",
    "Classic Ivory",
    "D",
    "110\"",
    "410g/m²",
    "",
    false
  ],
  [
    "RHZ-01",
    "Hazel",
    "DTG387-4M",
    "Onyx Shimmer",
    "D",
    "110\"",
    "453g/m²",
    "",
    false
  ],
  [
    "RHZ-02",
    "Hazel",
    "DTG387-7M",
    "Warm Sand",
    "D",
    "110\"",
    "453g/m²",
    "",
    false
  ],
  [
    "RHZ-03",
    "Hazel",
    "DTG387-8M",
    "Ocean Fog",
    "D",
    "110\"",
    "453g/m²",
    "",
    false
  ],
  [
    "RIV-01",
    "Ivy",
    "DTC417-3M",
    "Pure Snow",
    "D",
    "116\"",
    "373g/m²",
    "",
    false
  ],
  [
    "RJS-01",
    "Jasper",
    "DTW0281-13K",
    "Winter Frost",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "RJS-02",
    "Jasper",
    "DTW0281-22K",
    "Blushing Rose",
    "A",
    "112\"",
    "288g/m²",
    "",
    false
  ],
  [
    "RJS-03",
    "Jasper",
    "DTW0281-23K",
    "Sunset Tan",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "RJS-04",
    "Jasper",
    "DTW0281-24K",
    "Soft Pearl",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "RJS-05",
    "Jasper",
    "DTW0281-26K",
    "Lagoon Breeze",
    "A",
    "112\"",
    "288g/m²",
    "",
    false
  ],
  [
    "RJS-06",
    "Jasper",
    "DTW0281-29K",
    "Ivory Lace",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "RJS-07",
    "Jasper",
    "DTW0281-32K",
    "Pale Mist",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "RJS-08",
    "Jasper",
    "DTW0281-33K",
    "Alpine White",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "RJS-09",
    "Jasper",
    "DTW0281-35K",
    "Silver Dawn",
    "A",
    "112\"",
    "287g/m²",
    "",
    false
  ],
  [
    "RLE-01",
    "Lennox",
    "DTW4427-5K",
    "Pure Frost",
    "B",
    "110\"",
    "268g/m²",
    "",
    false
  ],
  [
    "RLY-01",
    "Lyla",
    "DTC237-3M",
    "Golden Drift",
    "D",
    "114\"",
    "255g/㎡",
    "",
    false
  ],
  [
    "RMA-01",
    "Maplewood",
    "DTG370-2K",
    "Butter Cream",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RMA-02",
    "Maplewood",
    "DTG370-3K",
    "Stone Path",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RMA-03",
    "Maplewood",
    "DTG370-4K",
    "Sunset Orange",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RMA-04",
    "Maplewood",
    "DTG370-6K",
    "Ashen Charcoal",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RME-01",
    "Mellow",
    "DTG369-2K",
    "Meadow Green",
    "C",
    "116\"",
    "330g/m²",
    "",
    false
  ],
  [
    "RME-02",
    "Mellow",
    "DTG369-4K",
    "Creamy Beige",
    "C",
    "116\"",
    "330g/m²",
    "",
    false
  ],
  [
    "RME-04",
    "Mellow",
    "DTG369-6K",
    "Warm Taupe",
    "C",
    "116\"",
    "330g/m²",
    "",
    false
  ],
  [
    "RMG-01",
    "Magnus",
    "DTW3613-5K",
    "Golden Sand",
    "B",
    "110\"",
    "274g/㎡",
    "",
    false
  ],
  [
    "RMI-01",
    "Mia",
    "DTC423-21M",
    "Golden Glow",
    "D",
    "114\"",
    "404g/m²",
    "",
    false
  ],
  [
    "RNE-01",
    "Nebula",
    "DTG306-2K",
    "Snowy Ivory",
    "B",
    "116\"",
    "400g/m²",
    "",
    false
  ],
  [
    "RNS-01",
    "Nestle",
    "DTG331-2M",
    "Soft Caramel",
    "D",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "RNS-02",
    "Nestle",
    "DTG331-3M",
    "Earthy Taupe",
    "D",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "RNS-03",
    "Nestle",
    "DTG331-5M",
    "Woodland Bark",
    "D",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "RNS-04",
    "Nestle",
    "DTG331-8M",
    "Deep Tide Blue",
    "D",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "RNS-05",
    "Nestle",
    "DTG331-9M",
    "Iron Gate",
    "D",
    "110\"",
    "385g/m²",
    "",
    false
  ],
  [
    "ROR-01",
    "Soren",
    "DTW3244-16M",
    "Glistening Slate",
    "D",
    "110\"",
    "410g/㎡",
    "",
    false
  ],
  [
    "RPA-01",
    "Paige",
    "DTC229-8M",
    "Sunlit Taupe",
    "D",
    "114\"",
    "227g/㎡",
    "",
    false
  ],
  [
    "RPR-01",
    "Provence",
    "DTW028-316K",
    "Earthy Taupe",
    "C",
    "110\"",
    "439g/m²",
    "",
    false
  ],
  [
    "RPR-02",
    "Provence",
    "DTW028-317K",
    "Cozy Pebble",
    "C",
    "110\"",
    "439g/m²",
    "",
    false
  ],
  [
    "RPR-03",
    "Provence",
    "DTW028-320K",
    "Soft Drift Grey",
    "C",
    "110\"",
    "510g/m²",
    "",
    false
  ],
  [
    "RPR-04",
    "Provence",
    "DTW028-610N",
    "Moonlight Grey",
    "C",
    "112\"",
    "526g/m²",
    "",
    false
  ],
  [
    "RPR-05",
    "Provence",
    "DTW028-612N",
    "Pure Whisper",
    "C",
    "112\"",
    "526g/m²",
    "",
    false
  ],
  [
    "RPR-06",
    "Provence",
    "DTW028-616N",
    "Ivory Cream",
    "C",
    "112\"",
    "526g/m²",
    "",
    false
  ],
  [
    "RPR-07",
    "Provence",
    "DTW028-712M",
    "Butter Glow",
    "C",
    "112\"",
    "452g/m²",
    "",
    false
  ],
  [
    "RPR-08",
    "Provence",
    "DTW028-714M",
    "Granite Stone",
    "C",
    "112\"",
    "452g/m²",
    "",
    false
  ],
  [
    "RPR-09",
    "Provence",
    "DTW028-715M",
    "Soft Sand",
    "C",
    "112\"",
    "452g/m²",
    "",
    false
  ],
  [
    "RPS-01",
    "Pansy",
    "DTC423-7M",
    "Warm Taupe",
    "D",
    "110\"",
    "418g/m²",
    "",
    false
  ],
  [
    "RRE-01",
    "Reverie",
    "DTG183-2K",
    "Pale Drift",
    "B",
    "116\"",
    "285g/m²",
    "",
    false
  ],
  [
    "RRG-01",
    "Harrison",
    "DTG388-6M",
    "Repose Grey",
    "C",
    "110\"",
    "425g/m²",
    "",
    false
  ],
  [
    "RRH-01",
    "Rhea",
    "DTC439-3M",
    "Crystal Clear",
    "C",
    "116\"",
    "336g/m²",
    "",
    false
  ],
  [
    "RRH-02",
    "Rhea",
    "DTC439-4M",
    "Gentle Beige",
    "C",
    "114\"",
    "341g/m²",
    "",
    false
  ],
  [
    "RRH-03",
    "Rhea",
    "DTC439-5M",
    "Soft Ivory",
    "C",
    "116\"",
    "336g/m²",
    "",
    false
  ],
  [
    "RSA-01",
    "Santana",
    "DTW0270-12N",
    "Ivory Snow",
    "D",
    "112\"",
    "280g/m²",
    "",
    false
  ],
  [
    "RSA-02",
    "Santana",
    "DTW0270-13N",
    "Ivory Silk",
    "D",
    "112\"",
    "280g/m²",
    "",
    false
  ],
  [
    "RSA-03",
    "Santana",
    "DTW0270-14N",
    "Natural Linen",
    "D",
    "112\"",
    "280g/m²",
    "",
    false
  ],
  [
    "RSE-01",
    "Sevilla",
    "DTB026-21K",
    "Tranquil Oasis",
    "B",
    "110\"",
    "421g/m²",
    "",
    false
  ],
  [
    "RSE-02",
    "Sevilla",
    "DTB026-2K",
    "Ivory Silk",
    "B",
    "110\"",
    "420g/m²",
    "",
    false
  ],
  [
    "RSE-03",
    "Sevilla",
    "DTB026-6K",
    "Blushing Apricot",
    "B",
    "112\"",
    "414g/m²",
    "",
    false
  ],
  [
    "RSE-04",
    "Sevilla",
    "DTB026-8K",
    "Rustic Harvest",
    "B",
    "110\"",
    "421g/m²",
    "",
    false
  ],
  [
    "RSL-01",
    "Solitude",
    "DTG365-2K",
    "Sand Dune",
    "C",
    "110\"",
    "382g/m²",
    "",
    false
  ],
  [
    "RSL-02",
    "Solitude",
    "DTG365-3K",
    "Slate Storm",
    "C",
    "116\"",
    "382g/m²",
    "",
    false
  ],
  [
    "RSL-03",
    "Solitude",
    "DTG365-4K",
    "Metalic Pewter",
    "C",
    "116\"",
    "382g/m²",
    "",
    false
  ],
  [
    "RSL-04",
    "Solitude",
    "DTG365-5K",
    "Silver Mist",
    "C",
    "116\"",
    "382g/m²",
    "",
    false
  ],
  [
    "RSL-05",
    "Solitude",
    "DTG365-7K",
    "Ivory Lace",
    "C",
    "110\"",
    "382g/m²",
    "",
    false
  ],
  [
    "RSN-01",
    "Stellan",
    "DTW141-2M",
    "Ivory Snow",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RSN-02",
    "Stellan",
    "DTW141-4M",
    "Morning Silver",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RSN-03",
    "Stellan",
    "DTW141-5M",
    "Ivory Silk",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RSN-04",
    "Stellan",
    "DTW141-6M",
    "Charcoal Stone",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RSN-05",
    "Stellan",
    "DTW141-7M",
    "Earthy Walnut",
    "D",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RSO-01",
    "Sophie",
    "DTB2149-10H",
    "Serene Horizon",
    "A",
    "110\"",
    "286g/m²",
    "",
    false
  ],
  [
    "RSO-02",
    "Sophie",
    "DTB2149-31H",
    "Desert Mirage",
    "A",
    "110\"",
    "286g/m²",
    "",
    false
  ],
  [
    "RSO-03",
    "Sophie",
    "DTB2149-8H",
    "Golden Ember",
    "A",
    "110\"",
    "286g/m²",
    "",
    false
  ],
  [
    "RSU-01",
    "Sunnybrook",
    "DTG373-2K",
    "Toasted Almond",
    "B",
    "110\"",
    "377g/m²",
    "",
    false
  ],
  [
    "RTH-01",
    "Theodora",
    "DTG384-7K",
    "Dove Grey",
    "C",
    "110\"",
    "336g/m²",
    "",
    false
  ],
  [
    "RTR-01",
    "Tranquil",
    "DTW0220-12M",
    "Pure Snow",
    "C",
    "110\"",
    "339g/m²",
    "",
    false
  ],
  [
    "RZA-01",
    "Zara",
    "DTB270-23H",
    "Frosted Snow",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RZA-02",
    "Zara",
    "DTB270-26H",
    "Gentle Drift",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RZA-03",
    "Zara",
    "DTB270-28H",
    "Dusky Fog",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RZA-04",
    "Zara",
    "DTB270-33H",
    "Golden Dune",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RZA-05",
    "Zara",
    "DTB270-34H",
    "Burnished Clay",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RZA-06",
    "Zara",
    "DTB270-37H",
    "Midnight Shadow",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RZA-07",
    "Zara",
    "DTB270-38H",
    "Lagoon Whisper",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RZA-08",
    "Zara",
    "DTB270-39H",
    "Summit Sky",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RZA-09",
    "Zara",
    "DTB270-43H",
    "Velvet Merlot",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RZA-10",
    "Zara",
    "DTB270-6H",
    "Urban Slate",
    "A",
    "110\"",
    "340g/m²",
    "",
    false
  ],
  [
    "RZE-01",
    "Zenith",
    "DTG204-6K",
    "Desert Sand",
    "C",
    "116\"",
    "315g/m²",
    "",
    false
  ],
  [
    "SB-01A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS177-15H",
    true
  ],
  [
    "SB-02A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS179-25H",
    true
  ],
  [
    "SB-03A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS534-54H",
    true
  ],
  [
    "SB-04A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS534-10H",
    true
  ],
  [
    "SB-05A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS534-48H",
    true
  ],
  [
    "SB-06A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS534-37H",
    true
  ],
  [
    "SB-07A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS534-63H",
    true
  ],
  [
    "SB-08A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS179-38H",
    true
  ],
  [
    "SB-09A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS191-38H",
    true
  ],
  [
    "SB-10A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS291-22H",
    true
  ],
  [
    "SB-11A",
    "Soft Breeze",
    "Soft Breeze",
    "",
    "A",
    "",
    "",
    "DTS534-52H",
    true
  ],
  [
    "SEAG05K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "114\"",
    "400g/m²",
    "DTG306-4K",
    false
  ],
  [
    "SEAG10K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "382g/m²",
    "DTG365-5K",
    false
  ],
  [
    "SEAG11K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "400g/m²",
    "DTG306-3K",
    false
  ],
  [
    "SEAG12K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "302g/m²",
    "DTG375-4K",
    false
  ],
  [
    "SEAG13K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "382g/m²",
    "DTG365-4K",
    false
  ],
  [
    "SEAG14K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "382g/m²",
    "DTG365-3K",
    false
  ],
  [
    "SECG09K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "302g/m²",
    "DTG375-3K",
    false
  ],
  [
    "SEEG01K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "400g/m²",
    "DTG306-2K",
    false
  ],
  [
    "SEEG02K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "330g/m²",
    "DTG369-4K",
    false
  ],
  [
    "SEFG18K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "315g/m²",
    "DTG230-21K",
    false
  ],
  [
    "SEGG08K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "330g/m²",
    "DTG369-2K",
    false
  ],
  [
    "SEHG03K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "110\"",
    "382g/m²",
    "DTG365-2K",
    false
  ],
  [
    "SEHG04K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "315g/m²",
    "DTG204-6K",
    false
  ],
  [
    "SEHG06K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "330g/m²",
    "DTG369-6K",
    false
  ],
  [
    "SETG15K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "400g/m²",
    "DTG306-6K",
    false
  ],
  [
    "SEVG17K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "112\"",
    "332g/m²",
    "DTG303-8K",
    false
  ],
  [
    "SEYG07K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "330g/m²",
    "DTG369-5K",
    false
  ],
  [
    "SEYG16K",
    "Sierra SunrisE",
    "Sierra SunrisE",
    "",
    "B",
    "116\"",
    "295g/m²",
    "DTG373-4K",
    false
  ],
  [
    "SH-01B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS534-50K",
    true
  ],
  [
    "SH-02B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS534-35K",
    true
  ],
  [
    "SH-03B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS312-89K",
    true
  ],
  [
    "SH-04B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS191-18K",
    true
  ],
  [
    "SH-05B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS312-59K",
    true
  ],
  [
    "SH-06B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS534-61K",
    true
  ],
  [
    "SH-07B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS534-53K",
    true
  ],
  [
    "SH-08B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS534-62K",
    true
  ],
  [
    "SH-09B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS312-71K",
    true
  ],
  [
    "SH-10B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS312-8K",
    true
  ],
  [
    "SH-11B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS312-55K",
    true
  ],
  [
    "SH-12B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS312-75K",
    true
  ],
  [
    "SH-13B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS312-52K",
    true
  ],
  [
    "SH-14B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS312-58K",
    true
  ],
  [
    "SH-15B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS312-05K",
    true
  ],
  [
    "SH-16B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS534-57K",
    true
  ],
  [
    "SH-17B",
    "Soft Haze",
    "Soft Haze",
    "",
    "B",
    "",
    "",
    "DTS312-06K",
    true
  ],
  [
    "SH1-1",
    "Sheer 1-1",
    "DTS191-18K",
    "",
    "B",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH1-2",
    "Sheer 1-2",
    "DTS177-15H",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH1-3",
    "Sheer 1-3",
    "DTS179-25H",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH1-4",
    "Sheer 1-4",
    "DTS179-38H",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH2-10",
    "Sheer 2-10",
    "DTS312-8K",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "SH2-2",
    "Sheer 2-2",
    "DTS312-06K",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "SH2-3",
    "Sheer 2-3",
    "DTS312-05K",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "SH2-4",
    "Sheer 2-4",
    "DTS312-55K",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "SH2-5",
    "Sheer 2-5",
    "DTS312-58K",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "SH2-6",
    "Sheer 2-6",
    "DTS312-59K",
    "",
    "B",
    "118\"",
    "",
    "",
    true
  ],
  [
    "SH2-9",
    "Sheer 2-9",
    "DTS312-89K",
    "",
    "B",
    "112\"",
    "",
    "",
    true
  ],
  [
    "SH3-1",
    "Sheer 3-1",
    "DTS534-10H",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH3-10",
    "Sheer 3-10",
    "DTS534-61K",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH3-11",
    "Sheer 3-11",
    "DTS534-62K",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH3-12",
    "Sheer 3-12",
    "DTS534-63H",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH3-2",
    "Sheer 3-2",
    "DTS534-35K",
    "",
    "B",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH3-3",
    "Sheer 3-3",
    "DTS534-37H",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH3-4",
    "Sheer 3-4",
    "DTS534-48H",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH3-5",
    "Sheer 3-5",
    "DTS534-50K",
    "",
    "B",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH3-6",
    "Sheer 3-6",
    "DTS534-52H",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH3-7",
    "Sheer 3-7",
    "DTS534-53K",
    "",
    "B",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SH3-8",
    "Sheer 3-8",
    "DTS534-54H",
    "",
    "A",
    "110\"",
    "",
    "",
    true
  ],
  [
    "SYAG14K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "112\"",
    "445g/m²",
    "DTG302-4K",
    false
  ],
  [
    "SYAG15K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "385g/m²",
    "DTG386-8K",
    false
  ],
  [
    "SYAG16K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "340g/m²",
    "DTG370-3K",
    false
  ],
  [
    "SYAG17K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "340g/m²",
    "DTG370-6K",
    false
  ],
  [
    "SYBG18K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "323g/m²",
    "DTG382-4K",
    false
  ],
  [
    "SYBG19K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "340g/m²",
    "DTG370-7K",
    false
  ],
  [
    "SYEB03K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "450g/m²",
    "DTB012-3K",
    false
  ],
  [
    "SYEG01K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "116\"",
    "302g/m²",
    "DTG375-2K",
    false
  ],
  [
    "SYEG04K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "382g/m²",
    "DTG365-7K",
    false
  ],
  [
    "SYFG10K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "377g/m²",
    "DTG373-2K",
    false
  ],
  [
    "SYFG11K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "323g/m²",
    "DTG382-2K",
    false
  ],
  [
    "SYFG12K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "385g/m²",
    "DTG386-2K",
    false
  ],
  [
    "SYFG20K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "340g/m²",
    "DTG370-4K",
    false
  ],
  [
    "SYHG05K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "385g/m²",
    "DTG386-4K",
    false
  ],
  [
    "SYHG06K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "340g/m²",
    "DTG370-2K",
    false
  ],
  [
    "SYHG07K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "323g/m²",
    "DTG382-6K",
    false
  ],
  [
    "SYHG08K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "321g/m²",
    "DTG389-5K",
    false
  ],
  [
    "SYHG09K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "116\"",
    "330g/m²",
    "DTG268-7K",
    false
  ],
  [
    "SYHG13K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "116\"",
    "403g/m²",
    "DTG392-2K",
    false
  ],
  [
    "SYWB02K",
    "Sunset SerenitY",
    "Sunset SerenitY",
    "",
    "B",
    "110\"",
    "450g/m²",
    "DTB012-2K",
    false
  ],
  [
    "TT-01B",
    "Timeless Tranquillily",
    "Timeless Tranquillily",
    "",
    "B",
    "",
    "",
    "DTW028-320K",
    false
  ],
  [
    "TT-02B",
    "Timeless Tranquillily",
    "Timeless Tranquillily",
    "",
    "B",
    "",
    "",
    "DTW028-317K",
    false
  ],
  [
    "TT-03B",
    "Timeless Tranquillily",
    "Timeless Tranquillily",
    "",
    "B",
    "",
    "",
    "DTW028-316K",
    false
  ],
  [
    "TYAW02K",
    "Timeless TranquillitY",
    "Timeless TranquillitY",
    "",
    "B",
    "110\"",
    "439g/m²",
    "DTW028-317K",
    false
  ],
  [
    "TYFW03K",
    "Timeless TranquillitY",
    "Timeless TranquillitY",
    "",
    "B",
    "110\"",
    "439g/m²",
    "DTW028-316K",
    false
  ],
  [
    "TYHW01K",
    "Timeless TranquillitY",
    "Timeless TranquillitY",
    "",
    "B",
    "110\"",
    "510g/m²",
    "DTW028-320K",
    false
  ],
  [
    "UC-01B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "DTE18-2M",
    false
  ],
  [
    "UC-02B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "UC-03B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "UC-04B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "UC-05B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "UC-06B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "UC-07B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "",
    false
  ],
  [
    "UC-08B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "DTE16-2K",
    false
  ],
  [
    "UC-09B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "DTE12-2K",
    false
  ],
  [
    "UC-10B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "DTG371-3K",
    false
  ],
  [
    "UC-11B",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "",
    "",
    "DTG304-4K",
    false
  ],
  [
    "UCME08K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "110\"",
    "255g/m²",
    "DTE16-2K",
    false
  ],
  [
    "UCSE09K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "110\"",
    "255g/m²",
    "DTE12-2K",
    false
  ],
  [
    "UCZG10K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "116\"",
    "292g/m²",
    "DTG371-3K",
    false
  ],
  [
    "UCZG11K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "110\"",
    "329g/m²",
    "DTG304-4K",
    false
  ],
  [
    "UCZP01K",
    "Urban Chic",
    "Urban Chic",
    "",
    "C",
    "110\"",
    "400g/m²",
    "DTE18-2M",
    false
  ],
  [
    "UCZP02K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "110\"",
    "400g/m²",
    "",
    false
  ],
  [
    "UCZP03K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "110\"",
    "400g/m²",
    "",
    false
  ],
  [
    "UCZP04K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "110\"",
    "400g/m²",
    "",
    false
  ],
  [
    "UCZP05K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "110\"",
    "400g/m²",
    "",
    false
  ],
  [
    "UCZP06K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "110\"",
    "400g/m²",
    "",
    false
  ],
  [
    "UCZP07K",
    "Urban Chic",
    "Urban Chic",
    "",
    "B",
    "110\"",
    "400g/m²",
    "",
    false
  ],
  [
    "UE-01C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTC422-21M",
    false
  ],
  [
    "UE-02C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTC417-3M",
    false
  ],
  [
    "UE-03C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTC439-3M",
    false
  ],
  [
    "UE-04C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTC419-8M",
    false
  ],
  [
    "UE-05C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTW0220-12M",
    false
  ],
  [
    "UE-06C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTC439-4M",
    false
  ],
  [
    "UE-07C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTC439-5M",
    false
  ],
  [
    "UE-08C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTW141-2M",
    false
  ],
  [
    "UE-09C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTW141-5M",
    false
  ],
  [
    "UE-10C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTW141-7M",
    false
  ],
  [
    "UE-11C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTW141-4M",
    false
  ],
  [
    "UE-12C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTW141-6M",
    false
  ],
  [
    "UE-13C",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "",
    "",
    "DTW3244-16M",
    false
  ],
  [
    "UEAW12M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "110\"",
    "340g/m²",
    "DTW141-6M",
    false
  ],
  [
    "UEEC04M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "116\"",
    "308g/m²",
    "DTC419-8M",
    false
  ],
  [
    "UEEC07M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "116\"",
    "336g/m²",
    "DTC439-5M",
    false
  ],
  [
    "UEEW05M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "110\"",
    "339g/m²",
    "DTW0220-12M",
    false
  ],
  [
    "UEEW08M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "110\"",
    "340g/m²",
    "DTW141-2M",
    false
  ],
  [
    "UEEW09M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "110\"",
    "340g/m²",
    "DTW141-5M",
    false
  ],
  [
    "UEHW10M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "110\"",
    "340g/m²",
    "DTW141-7M",
    false
  ],
  [
    "UELC06M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "114\"",
    "341g/m²",
    "DTC439-4M",
    false
  ],
  [
    "UELW11M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "110\"",
    "340g/m²",
    "DTW141-4M",
    false
  ],
  [
    "UEWC01M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "116\"",
    "300g/m²",
    "DTC422-21M",
    false
  ],
  [
    "UEWC02M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "116\"",
    "373g/m²",
    "DTC417-3M",
    false
  ],
  [
    "UEWC03M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "116\"",
    "336g/m²",
    "DTC439-3M",
    false
  ],
  [
    "UEZW13M",
    "Urban Elegance",
    "Urban Elegance",
    "",
    "C",
    "110\"",
    "410g/m²",
    "DTW3244-16M",
    false
  ],
  [
    "UO-01A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "",
    false
  ],
  [
    "UO-02A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB2149-8H",
    false
  ],
  [
    "UO-03A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB2149-10H",
    false
  ],
  [
    "UO-04A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "",
    false
  ],
  [
    "UO-05A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB2149-31H",
    false
  ],
  [
    "UO-06A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB270-23H",
    false
  ],
  [
    "UO-07A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB270-26H",
    false
  ],
  [
    "UO-08A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB270-28H",
    false
  ],
  [
    "UO-09A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB270-6H",
    false
  ],
  [
    "UO-10A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB270-33H",
    false
  ],
  [
    "UO-11A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB270-34H",
    false
  ],
  [
    "UO-12A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB270-38H",
    false
  ],
  [
    "UO-13A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB270-39H",
    false
  ],
  [
    "UO-14A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB270-43H",
    false
  ],
  [
    "UO-15A",
    "Urban Oasis",
    "Urban Oasis",
    "",
    "A",
    "",
    "",
    "DTB270-37H",
    false
  ],
  [
    "URAB06H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "340g/m²",
    "DTB270-23H",
    false
  ],
  [
    "UREB07H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "340g/m²",
    "DTB270-26H",
    false
  ],
  [
    "URHB05H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "286g/m²",
    "DTB2149-31H",
    false
  ],
  [
    "URHB10H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "340g/m²",
    "DTB270-33H",
    false
  ],
  [
    "URKB15H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "340g/m²",
    "DTB270-37H",
    false
  ],
  [
    "URMB04H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "286g/m²",
    "",
    false
  ],
  [
    "URMB08H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "340g/m²",
    "DTB270-28H",
    false
  ],
  [
    "URMB12H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "340g/m²",
    "DTB270-38H",
    false
  ],
  [
    "URRB14H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "340g/m²",
    "DTB270-43H",
    false
  ],
  [
    "URSB03H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "286g/m²",
    "DTB2149-10H",
    false
  ],
  [
    "URSB13H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "340g/m²",
    "DTB270-39H",
    false
  ],
  [
    "URTB11H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "340g/m²",
    "DTB270-34H",
    false
  ],
  [
    "URUB09H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "340g/m²",
    "DTB270-6H",
    false
  ],
  [
    "URWB01H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "286g/m²",
    "",
    false
  ],
  [
    "URYB02H",
    "URban Oasis",
    "URban Oasis",
    "",
    "A",
    "110\"",
    "286g/m²",
    "DTB2149-8H",
    false
  ]
];

const MATERIALS_DB = COMPACT_MATERIALS_DB.map(arr => ({
  pattern_code: arr[0],
  collection: arr[1],
  code: arr[2],
  color: arr[3],
  group: arr[4],
  width: arr[5],
  weight: arr[6],
  old_model: arr[7],
  is_sheer: arr[8]
}));


// 2. State Management
let currentOrderItems = [];
let activeTab = 'tab-calculator';
let activeItemType = 'roman';

// 3. Document Elements & Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Set current date
    const dateBadge = document.getElementById('date-badge');
    if (dateBadge) {
        const now = new Date();
        dateBadge.textContent = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`;
    }

    // Initialize tabs
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Initialize item type toggles
    const typeToggles = document.querySelectorAll('.type-toggle-btn');
    typeToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetType = btn.getAttribute('data-type');
            switchItemType(targetType);
            typeToggles.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Autocomplete setup
    setupAutocomplete();

    // Form submit handler
    const itemForm = document.getElementById('item-form');
    if (itemForm) {
        itemForm.addEventListener('submit', handleAddItemSubmit);
    }

    // Shipping handler
    const shippingInput = document.getElementById('meta-shipping');
    if (shippingInput) {
        shippingInput.addEventListener('input', updateTotalsDisplay);
    }

    // Clear all items button
    const clearBtn = document.getElementById('btn-clear-all');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('确认清空订单中的所有定制产品吗？')) {
                currentOrderItems = [];
                renderItemsTable();
            }
        });
    }

    // Export/Print button handlers
    setupActionButtons();

    // Excel Upload handlers
    setupExcelUpload();

    // Load initial materials table
    renderMaterialsTable();
}

// 4. Tab & Type Switching
function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    document.getElementById(tabId).classList.add('active-tab');

    // Update header
    const headerTitle = document.getElementById('main-header');
    if (headerTitle) {
        headerTitle.textContent = (tabId === 'tab-calculator') ? '智能报价计算器' : '物料参考数据库';
    }
}

function switchItemType(type) {
    activeItemType = type;
    document.getElementById('form-item-type').value = type;

    // Show/Hide fields
    const heightGroup = document.getElementById('group-height');
    const fabricGroup = document.getElementById('group-fabric');
    const trimGroup = document.getElementById('group-trim');
    const mountGroup = document.getElementById('group-mount');

    const widthLabel = document.querySelector('label[for="item-width"]');
    const widthSuffix = document.getElementById('item-width') ? document.getElementById('item-width').parentElement.querySelector('.suffix') : null;
    const fabricLabel = document.querySelector('label[for="item-fabric"]');
    const fabricInput = document.getElementById('item-fabric');
    const widthInput = document.getElementById('item-width');

    if (type === 'manual') {
        if (heightGroup) heightGroup.style.display = 'none';
        if (fabricGroup) fabricGroup.style.display = 'flex';
        if (trimGroup) trimGroup.style.display = 'none';
        if (mountGroup) mountGroup.style.display = 'none';

        if (widthLabel) widthLabel.textContent = "金额 (Amount - USD)";
        if (widthSuffix) widthSuffix.style.display = 'none';
        if (fabricLabel) fabricLabel.textContent = "收费/调整项描述 (Description)";
        if (fabricInput) fabricInput.placeholder = "例如: 安装费 / 运费 / 手动折扣";
        if (widthInput) widthInput.placeholder = "例如: 100 或 -50";
    } else if (type === 'rod') {
        if (heightGroup) heightGroup.style.display = 'none';
        if (fabricGroup) fabricGroup.style.display = 'none';
        if (trimGroup) trimGroup.style.display = 'none';
        if (mountGroup) mountGroup.style.display = 'none';

        if (widthLabel) widthLabel.textContent = "成品宽度 (Width - Inches)";
        if (widthSuffix) widthSuffix.style.display = 'flex';
        if (fabricLabel) fabricLabel.textContent = "面料代码 (Fabric Code)";
        if (fabricInput) fabricInput.placeholder = "输入代码检索，例如: ML-01B";
        if (widthInput) widthInput.placeholder = "例如: 21.625";
    } else {
        if (heightGroup) heightGroup.style.display = 'flex';
        if (fabricGroup) fabricGroup.style.display = 'flex';
        if (trimGroup) trimGroup.style.display = 'flex';
        if (mountGroup) mountGroup.style.display = 'flex';

        if (widthLabel) widthLabel.textContent = "成品宽度 (Width - Inches)";
        if (widthSuffix) widthSuffix.style.display = 'flex';
        if (fabricLabel) fabricLabel.textContent = "面料代码 (Fabric Code)";
        if (fabricInput) fabricInput.placeholder = "输入代码检索，例如: ML-01B";
        if (widthInput) widthInput.placeholder = "例如: 21.625";
    }

    // Show/Hide conditional fields
    document.querySelectorAll('.dynamic-field').forEach(field => {
        field.style.display = 'none';
    });

    if (type === 'roman') {
        document.querySelectorAll('.roman-only').forEach(field => field.style.display = 'flex');
    } else if (type === 'drapery') {
        document.querySelectorAll('.drapery-only').forEach(field => field.style.display = 'flex');
    }
}

// 5. Autocomplete System
function setupAutocomplete() {
    const fabricInput = document.getElementById('item-fabric');
    const listContainer = document.getElementById('autocomplete-list');
    const groupSelect = document.getElementById('item-fabric-group');

    if (!fabricInput || !listContainer) return;

    fabricInput.addEventListener('input', function() {
        const val = this.value.trim().toUpperCase();
        listContainer.innerHTML = '';
        if (!val) return;

        const matches = MATERIALS_DB.filter(m =>
            m.pattern_code.toUpperCase().includes(val) ||
            (m.code && m.code.toUpperCase().includes(val)) ||
            (m.old_model && m.old_model.toUpperCase().includes(val)) ||
            (m.collection && m.collection.toUpperCase().includes(val)) ||
            (m.color && m.color.toUpperCase().includes(val))
        ).slice(0, 10);

        matches.forEach(item => {
            const div = document.createElement('div');
            const displayCode = item.old_model ? `${item.pattern_code} (${item.old_model})` : item.pattern_code;
            div.innerHTML = `<strong>${displayCode}</strong> <span style="color: #666; margin-left: 10px;">${item.collection || ''} ${item.color || ''}</span> <span class="item-group-badge">Group ${item.group}</span>`;
            div.addEventListener('click', () => {
                fabricInput.value = item.pattern_code;
                listContainer.innerHTML = '';
                fabricInput.setAttribute('data-selected-group', item.group);
                if (groupSelect) {
                    groupSelect.value = item.group;
                }
            });
            listContainer.appendChild(div);
        });
    });

    fabricInput.addEventListener('change', function() {
        const val = this.value.trim().toUpperCase();
        const matchedMat = MATERIALS_DB.find(m =>
            m.pattern_code.toUpperCase() === val ||
            (m.code && m.code.toUpperCase() === val) ||
            (m.old_model && m.old_model.toUpperCase() === val)
        );
        if (matchedMat) {
            fabricInput.setAttribute('data-selected-group', matchedMat.group);
            if (groupSelect) groupSelect.value = matchedMat.group;
        } else {
            const extracted = extractGroupFromCode(val);
            if (extracted) {
                fabricInput.setAttribute('data-selected-group', extracted);
                if (groupSelect) groupSelect.value = extracted;
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== fabricInput && e.target.parentNode !== listContainer) {
            listContainer.innerHTML = '';
        }
    });
}

// 6. Quoting Calculations Engine for Jin Park

// Translation helper function
window.t = function(zh, en) {
    return (window.currentLanguage === 'en') ? en : zh;
};

// Folds and Hook/Fabric database lookup constants
const ROMAN_FOLDS_DB = {"\u524d\u51f8\u540e\u51f8\u6b3e3cm": {"24": 4, "24.125": 4, "24.25": 4, "24.375": 4, "24.5": 4, "24.625": 4, "24.75": 4, "24.875": 4, "25": 4, "25.125": 4, "25.25": 4, "25.375": 4, "25.5": 4, "25.625": 4, "25.75": 4, "25.875": 4, "26": 4, "26.125": 4, "26.25": 4, "26.375": 4, "26.5": 4, "26.625": 4, "26.75": 4, "26.875": 4, "27": 4, "27.125": 4, "27.25": 4, "27.375": 4, "27.5": 4, "27.625": 4, "27.75": 4, "27.875": 4, "28": 4, "28.125": 4, "28.25": 4, "28.375": 4, "28.5": 4, "28.625": 4, "28.75": 4, "28.875": 4, "29": 5, "29.125": 5, "29.25": 5, "29.375": 5, "29.5": 5, "29.625": 5, "29.75": 5, "29.875": 5, "30": 5, "30.125": 5, "30.25": 5, "30.375": 5, "30.5": 5, "30.625": 5, "30.75": 5, "30.875": 5, "31": 5, "31.125": 5, "31.25": 5, "31.375": 5, "31.5": 5, "31.625": 5, "31.75": 5, "31.875": 5, "32": 5, "32.125": 5, "32.25": 5, "32.375": 5, "32.5": 5, "32.625": 5, "32.75": 5, "32.875": 5, "33": 5, "33.125": 5, "33.25": 5, "33.375": 5, "33.5": 5, "33.625": 5, "33.75": 5, "33.875": 5, "34": 5, "34.125": 5, "34.25": 5, "34.375": 5, "34.5": 5, "34.625": 5, "34.75": 5, "34.875": 5, "35": 5, "35.125": 5, "35.25": 5, "35.375": 5, "35.5": 5, "35.625": 5, "35.75": 5, "35.875": 5, "36": 6, "36.125": 6, "36.25": 6, "36.375": 6, "36.5": 6, "36.625": 6, "36.75": 6, "36.875": 6, "37": 6, "37.125": 6, "37.25": 6, "37.375": 6, "37.5": 6, "37.625": 6, "37.75": 6, "37.875": 6, "38": 6, "38.125": 6, "38.25": 6, "38.375": 6, "38.5": 6, "38.625": 6, "38.75": 6, "38.875": 6, "39": 6, "39.125": 6, "39.25": 6, "39.375": 6, "39.5": 6, "39.625": 6, "39.75": 6, "39.875": 6, "40": 6, "40.125": 6, "40.25": 6, "40.375": 6, "40.5": 6, "40.625": 6, "40.75": 6, "40.875": 6, "41": 6, "41.125": 6, "41.25": 6, "41.375": 6, "41.5": 6, "41.625": 6, "41.75": 6, "41.875": 6, "42": 6, "42.125": 6, "42.25": 6, "42.375": 6, "42.5": 6, "42.625": 6, "42.75": 6, "42.875": 6, "43": 7, "43.125": 7, "43.25": 7, "43.375": 7, "43.5": 7, "43.625": 7, "43.75": 7, "43.875": 7, "44": 7, "44.125": 7, "44.25": 7, "44.375": 7, "44.5": 7, "44.625": 7, "44.75": 7, "44.875": 7, "45": 7, "45.125": 7, "45.25": 7, "45.375": 7, "45.5": 7, "45.625": 7, "45.75": 7, "45.875": 7, "46": 7, "46.125": 7, "46.25": 7, "46.375": 7, "46.5": 7, "46.625": 7, "46.75": 7, "46.875": 7, "47": 7, "47.125": 7, "47.25": 7, "47.375": 7, "47.5": 7, "47.625": 7, "47.75": 7, "47.875": 7, "48": 7, "48.125": 7, "48.25": 7, "48.375": 7, "48.5": 7, "48.625": 7, "48.75": 7, "48.875": 7, "49": 7, "49.125": 7, "49.25": 7, "49.375": 7, "49.5": 7, "49.625": 7, "49.75": 7, "49.875": 7, "50": 7, "50.125": 7, "50.25": 7, "50.375": 7, "50.5": 7, "50.625": 7, "50.75": 7, "50.875": 7, "51": 8, "51.125": 8, "51.25": 8, "51.375": 8, "51.5": 8, "51.625": 8, "51.75": 8, "51.875": 8, "52": 8, "52.125": 8, "52.25": 8, "52.375": 8, "52.5": 8, "52.625": 8, "52.75": 8, "52.875": 8, "53": 8, "53.125": 8, "53.25": 8, "53.375": 8, "53.5": 8, "53.625": 8, "53.75": 8, "53.875": 8, "54": 8, "54.125": 8, "54.25": 8, "54.375": 8, "54.5": 8, "54.625": 8, "54.75": 8, "54.875": 8, "55": 8, "55.125": 8, "55.25": 8, "55.375": 8, "55.5": 8, "55.625": 8, "55.75": 8, "55.875": 8, "56": 8, "56.125": 8, "56.25": 8, "56.375": 8, "56.5": 8, "56.625": 8, "56.75": 8, "56.875": 8, "57": 8, "57.125": 8, "57.25": 8, "57.375": 8, "57.5": 8, "57.625": 8, "57.75": 8, "57.875": 8, "58": 9, "58.125": 9, "58.25": 9, "58.375": 9, "58.5": 9, "58.625": 9, "58.75": 9, "58.875": 9, "59": 9, "59.125": 9, "59.25": 9, "59.375": 9, "59.5": 9, "59.625": 9, "59.75": 9, "59.875": 9, "60": 9, "60.125": 9, "60.25": 9, "60.375": 9, "60.5": 9, "60.625": 9, "60.75": 9, "60.875": 9, "61": 9, "61.125": 9, "61.25": 9, "61.375": 9, "61.5": 9, "61.625": 9, "61.75": 9, "61.875": 9, "62": 9, "62.125": 9, "62.25": 9, "62.375": 9, "62.5": 9, "62.625": 9, "62.75": 9, "62.875": 9, "63": 9, "63.125": 9, "63.25": 9, "63.375": 9, "63.5": 9, "63.625": 9, "63.75": 9, "63.875": 9, "64": 9, "64.125": 9, "64.25": 9, "64.375": 9, "64.5": 9, "64.625": 9, "64.75": 9, "64.875": 9, "65": 9, "65.125": 9, "65.25": 9, "65.375": 9, "65.5": 9, "65.625": 9, "65.75": 9, "65.875": 9, "66": 9, "66.125": 9, "66.25": 9, "66.375": 9, "66.5": 9, "66.625": 9, "66.75": 9, "66.875": 9, "67": 10, "67.125": 10, "67.25": 10, "67.375": 10, "67.5": 10, "67.625": 10, "67.75": 10, "67.875": 10, "68": 10, "68.125": 10, "68.25": 10, "68.375": 10, "68.5": 10, "68.625": 10, "68.75": 10, "68.875": 10, "69": 10, "69.125": 10, "69.25": 10, "69.375": 10, "69.5": 10, "69.625": 10, "69.75": 10, "69.875": 10, "70": 10, "70.125": 10, "70.25": 10, "70.375": 10, "70.5": 10, "70.625": 10, "70.75": 10, "70.875": 10, "71": 10, "71.125": 10, "71.25": 10, "71.375": 10, "71.5": 10, "71.625": 10, "71.75": 10, "71.875": 10, "72": 10, "72.125": 10, "72.25": 10, "72.375": 10, "72.5": 10, "72.625": 10, "72.75": 10, "72.875": 10, "73": 10, "73.125": 10, "73.25": 10, "73.375": 10, "73.5": 10, "73.625": 10, "73.75": 10, "73.875": 10, "74": 10, "74.125": 10, "74.25": 10, "74.375": 10, "74.5": 10, "74.625": 10, "74.75": 10, "74.875": 10, "75": 11, "75.125": 11, "75.25": 11, "75.375": 11, "75.5": 11, "75.625": 11, "75.75": 11, "75.875": 11, "76": 11, "76.125": 11, "76.25": 11, "76.375": 11, "76.5": 11, "76.625": 11, "76.75": 11, "76.875": 11, "77": 11, "77.125": 11, "77.25": 11, "77.375": 11, "77.5": 11, "77.625": 11, "77.75": 11, "77.875": 11, "78": 11, "78.125": 11, "78.25": 11, "78.375": 11, "78.5": 11, "78.625": 11, "78.75": 11, "78.875": 11, "79": 11, "79.125": 11, "79.25": 11, "79.375": 11, "79.5": 11, "79.625": 11, "79.75": 11, "79.875": 11, "80": 11, "80.125": 11, "80.25": 11, "80.375": 11, "80.5": 11, "80.625": 11, "80.75": 11, "80.875": 11, "81": 11, "81.125": 11, "81.25": 11, "81.375": 11, "81.5": 11, "81.625": 11, "81.75": 11, "81.875": 11, "82": 12, "82.125": 12, "82.25": 12, "82.375": 12, "82.5": 12, "82.625": 12, "82.75": 12, "82.875": 12, "83": 12, "83.125": 12, "83.25": 12, "83.375": 12, "83.5": 12, "83.625": 12, "83.75": 12, "83.875": 12, "84": 12, "84.125": 12, "84.25": 12, "84.375": 12, "84.5": 12, "84.625": 12, "84.75": 12, "84.875": 12, "85": 12, "85.125": 12, "85.25": 12, "85.375": 12, "85.5": 12, "85.625": 12, "85.75": 12, "85.875": 12, "86": 12, "86.125": 12, "86.25": 12, "86.375": 12, "86.5": 12, "86.625": 12, "86.75": 12, "86.875": 12, "87": 12, "87.125": 12, "87.25": 12, "87.375": 12, "87.5": 12, "87.625": 12, "87.75": 12, "87.875": 12, "88": 13, "88.125": 13, "88.25": 13, "88.375": 13, "88.5": 13, "88.625": 13, "88.75": 13, "88.875": 13, "89": 13, "89.125": 13, "89.25": 13, "89.375": 13, "89.5": 13, "89.625": 13, "89.75": 13, "89.875": 13, "90": 13, "90.125": 13, "90.25": 13, "90.375": 13, "90.5": 13, "90.625": 13, "90.75": 13, "90.875": 13, "91": 13, "91.125": 13, "91.25": 13, "91.375": 13, "91.5": 13, "91.625": 13, "91.75": 13, "91.875": 13, "92": 13, "92.125": 13, "92.25": 13, "92.375": 13, "92.5": 13, "92.625": 13, "92.75": 13, "92.875": 13, "93": 13, "93.125": 13, "93.25": 13, "93.375": 13, "93.5": 13, "93.625": 13, "93.75": 13, "93.875": 13, "94": 13, "94.125": 13, "94.25": 13, "94.375": 13, "94.5": 13, "94.625": 13, "94.75": 13, "94.875": 13, "95": 13, "95.125": 13, "95.25": 13, "95.375": 13, "95.5": 13, "95.625": 13, "95.75": 13, "95.875": 13, "96": 13}, "\u4e0a\u4e0b\u5f00\u54083cm": {"24": 4, "24.125": 4, "24.25": 4, "24.375": 4, "24.5": 4, "24.625": 4, "24.75": 4, "24.875": 4, "25": 4, "25.125": 4, "25.25": 4, "25.375": 4, "25.5": 4, "25.625": 4, "25.75": 4, "25.875": 4, "26": 4, "26.125": 4, "26.25": 4, "26.375": 4, "26.5": 4, "26.625": 4, "26.75": 4, "26.875": 4, "27": 4, "27.125": 4, "27.25": 4, "27.375": 4, "27.5": 4, "27.625": 4, "27.75": 4, "27.875": 4, "28": 4, "28.125": 4, "28.25": 4, "28.375": 4, "28.5": 4, "28.625": 4, "28.75": 4, "28.875": 4, "29": 5, "29.125": 5, "29.25": 5, "29.375": 5, "29.5": 5, "29.625": 5, "29.75": 5, "29.875": 5, "30": 5, "30.125": 5, "30.25": 5, "30.375": 5, "30.5": 5, "30.625": 5, "30.75": 5, "30.875": 5, "31": 5, "31.125": 5, "31.25": 5, "31.375": 5, "31.5": 5, "31.625": 5, "31.75": 5, "31.875": 5, "32": 5, "32.125": 5, "32.25": 5, "32.375": 5, "32.5": 5, "32.625": 5, "32.75": 5, "32.875": 5, "33": 5, "33.125": 5, "33.25": 5, "33.375": 5, "33.5": 5, "33.625": 5, "33.75": 5, "33.875": 5, "34": 5, "34.125": 5, "34.25": 5, "34.375": 5, "34.5": 5, "34.625": 5, "34.75": 5, "34.875": 5, "35": 5, "35.125": 5, "35.25": 5, "35.375": 5, "35.5": 5, "35.625": 5, "35.75": 5, "35.875": 5, "36": 6, "36.125": 6, "36.25": 6, "36.375": 6, "36.5": 6, "36.625": 6, "36.75": 6, "36.875": 6, "37": 6, "37.125": 6, "37.25": 6, "37.375": 6, "37.5": 6, "37.625": 6, "37.75": 6, "37.875": 6, "38": 6, "38.125": 6, "38.25": 6, "38.375": 6, "38.5": 6, "38.625": 6, "38.75": 6, "38.875": 6, "39": 6, "39.125": 6, "39.25": 6, "39.375": 6, "39.5": 6, "39.625": 6, "39.75": 6, "39.875": 6, "40": 6, "40.125": 6, "40.25": 6, "40.375": 6, "40.5": 6, "40.625": 6, "40.75": 6, "40.875": 6, "41": 6, "41.125": 6, "41.25": 6, "41.375": 6, "41.5": 6, "41.625": 6, "41.75": 6, "41.875": 6, "42": 6, "42.125": 6, "42.25": 6, "42.375": 6, "42.5": 6, "42.625": 6, "42.75": 6, "42.875": 6, "43": 7, "43.125": 7, "43.25": 7, "43.375": 7, "43.5": 7, "43.625": 7, "43.75": 7, "43.875": 7, "44": 7, "44.125": 7, "44.25": 7, "44.375": 7, "44.5": 7, "44.625": 7, "44.75": 7, "44.875": 7, "45": 7, "45.125": 7, "45.25": 7, "45.375": 7, "45.5": 7, "45.625": 7, "45.75": 7, "45.875": 7, "46": 7, "46.125": 7, "46.25": 7, "46.375": 7, "46.5": 7, "46.625": 7, "46.75": 7, "46.875": 7, "47": 7, "47.125": 7, "47.25": 7, "47.375": 7, "47.5": 7, "47.625": 7, "47.75": 7, "47.875": 7, "48": 7, "48.125": 7, "48.25": 7, "48.375": 7, "48.5": 7, "48.625": 7, "48.75": 7, "48.875": 7, "49": 7, "49.125": 7, "49.25": 7, "49.375": 7, "49.5": 7, "49.625": 7, "49.75": 7, "49.875": 7, "50": 7, "50.125": 7, "50.25": 7, "50.375": 7, "50.5": 7, "50.625": 7, "50.75": 7, "50.875": 7, "51": 8, "51.125": 8, "51.25": 8, "51.375": 8, "51.5": 8, "51.625": 8, "51.75": 8, "51.875": 8, "52": 8, "52.125": 8, "52.25": 8, "52.375": 8, "52.5": 8, "52.625": 8, "52.75": 8, "52.875": 8, "53": 8, "53.125": 8, "53.25": 8, "53.375": 8, "53.5": 8, "53.625": 8, "53.75": 8, "53.875": 8, "54": 8, "54.125": 8, "54.25": 8, "54.375": 8, "54.5": 8, "54.625": 8, "54.75": 8, "54.875": 8, "55": 8, "55.125": 8, "55.25": 8, "55.375": 8, "55.5": 8, "55.625": 8, "55.75": 8, "55.875": 8, "56": 8, "56.125": 8, "56.25": 8, "56.375": 8, "56.5": 8, "56.625": 8, "56.75": 8, "56.875": 8, "57": 8, "57.125": 8, "57.25": 8, "57.375": 8, "57.5": 8, "57.625": 8, "57.75": 8, "57.875": 8, "58": 9, "58.125": 9, "58.25": 9, "58.375": 9, "58.5": 9, "58.625": 9, "58.75": 9, "58.875": 9, "59": 9, "59.125": 9, "59.25": 9, "59.375": 9, "59.5": 9, "59.625": 9, "59.75": 9, "59.875": 9, "60": 9, "60.125": 9, "60.25": 9, "60.375": 9, "60.5": 9, "60.625": 9, "60.75": 9, "60.875": 9, "61": 9, "61.125": 9, "61.25": 9, "61.375": 9, "61.5": 9, "61.625": 9, "61.75": 9, "61.875": 9, "62": 9, "62.125": 9, "62.25": 9, "62.375": 9, "62.5": 9, "62.625": 9, "62.75": 9, "62.875": 9, "63": 9, "63.125": 9, "63.25": 9, "63.375": 9, "63.5": 9, "63.625": 9, "63.75": 9, "63.875": 9, "64": 9, "64.125": 9, "64.25": 9, "64.375": 9, "64.5": 9, "64.625": 9, "64.75": 9, "64.875": 9, "65": 9, "65.125": 9, "65.25": 9, "65.375": 9, "65.5": 9, "65.625": 9, "65.75": 9, "65.875": 9, "66": 9, "66.125": 9, "66.25": 9, "66.375": 9, "66.5": 9, "66.625": 9, "66.75": 9, "66.875": 9, "67": 10, "67.125": 10, "67.25": 10, "67.375": 10, "67.5": 10, "67.625": 10, "67.75": 10, "67.875": 10, "68": 10, "68.125": 10, "68.25": 10, "68.375": 10, "68.5": 10, "68.625": 10, "68.75": 10, "68.875": 10, "69": 10, "69.125": 10, "69.25": 10, "69.375": 10, "69.5": 10, "69.625": 10, "69.75": 10, "69.875": 10, "70": 10, "70.125": 10, "70.25": 10, "70.375": 10, "70.5": 10, "70.625": 10, "70.75": 10, "70.875": 10, "71": 10, "71.125": 10, "71.25": 10, "71.375": 10, "71.5": 10, "71.625": 10, "71.75": 10, "71.875": 10, "72": 10, "72.125": 10, "72.25": 10, "72.375": 10, "72.5": 10, "72.625": 10, "72.75": 10, "72.875": 10, "73": 10, "73.125": 10, "73.25": 10, "73.375": 10, "73.5": 10, "73.625": 10, "73.75": 10, "73.875": 10, "74": 10, "74.125": 10, "74.25": 10, "74.375": 10, "74.5": 10, "74.625": 10, "74.75": 10, "74.875": 10, "75": 11, "75.125": 11, "75.25": 11, "75.375": 11, "75.5": 11, "75.625": 11, "75.75": 11, "75.875": 11, "76": 11, "76.125": 11, "76.25": 11, "76.375": 11, "76.5": 11, "76.625": 11, "76.75": 11, "76.875": 11, "77": 11, "77.125": 11, "77.25": 11, "77.375": 11, "77.5": 11, "77.625": 11, "77.75": 11, "77.875": 11, "78": 11, "78.125": 11, "78.25": 11, "78.375": 11, "78.5": 11, "78.625": 11, "78.75": 11, "78.875": 11, "79": 11, "79.125": 11, "79.25": 11, "79.375": 11, "79.5": 11, "79.625": 11, "79.75": 11, "79.875": 11, "80": 11, "80.125": 11, "80.25": 11, "80.375": 11, "80.5": 11, "80.625": 11, "80.75": 11, "80.875": 11, "81": 11, "81.125": 11, "81.25": 11, "81.375": 11, "81.5": 11, "81.625": 11, "81.75": 11, "81.875": 11, "82": 12, "82.125": 12, "82.25": 12, "82.375": 12, "82.5": 12, "82.625": 12, "82.75": 12, "82.875": 12, "83": 12, "83.125": 12, "83.25": 12, "83.375": 12, "83.5": 12, "83.625": 12, "83.75": 12, "83.875": 12, "84": 12, "84.125": 12, "84.25": 12, "84.375": 12, "84.5": 12, "84.625": 12, "84.75": 12, "84.875": 12, "85": 12, "85.125": 12, "85.25": 12, "85.375": 12, "85.5": 12, "85.625": 12, "85.75": 12, "85.875": 12, "86": 12, "86.125": 12, "86.25": 12, "86.375": 12, "86.5": 12, "86.625": 12, "86.75": 12, "86.875": 12, "87": 12, "87.125": 12, "87.25": 12, "87.375": 12, "87.5": 12, "87.625": 12, "87.75": 12, "87.875": 12, "88": 13, "88.125": 13, "88.25": 13, "88.375": 13, "88.5": 13, "88.625": 13, "88.75": 13, "88.875": 13, "89": 13, "89.125": 13, "89.25": 13, "89.375": 13, "89.5": 13, "89.625": 13, "89.75": 13, "89.875": 13, "90": 13, "90.125": 13, "90.25": 13, "90.375": 13, "90.5": 13, "90.625": 13, "90.75": 13, "90.875": 13, "91": 13, "91.125": 13, "91.25": 13, "91.375": 13, "91.5": 13, "91.625": 13, "91.75": 13, "91.875": 13, "92": 13, "92.125": 13, "92.25": 13, "92.375": 13, "92.5": 13, "92.625": 13, "92.75": 13, "92.875": 13, "93": 13, "93.125": 13, "93.25": 13, "93.375": 13, "93.5": 13, "93.625": 13, "93.75": 13, "93.875": 13, "94": 13, "94.125": 13, "94.25": 13, "94.375": 13, "94.5": 13, "94.625": 13, "94.75": 13, "94.875": 13, "95": 13, "95.125": 13, "95.25": 13, "95.375": 13, "95.5": 13, "95.625": 13, "95.75": 13, "95.875": 13, "96": 13}, "\u9c7c\u9cde\u6298\u53e0\u6b3e3cm": {"24": 4, "24.125": 4, "24.25": 4, "24.375": 4, "24.5": 4, "24.625": 4, "24.75": 4, "24.875": 4, "25": 4, "25.125": 4, "25.25": 4, "25.375": 4, "25.5": 4, "25.625": 4, "25.75": 4, "25.875": 4, "26": 4, "26.125": 4, "26.25": 4, "26.375": 4, "26.5": 4, "26.625": 4, "26.75": 4, "26.875": 4, "27": 5, "27.125": 5, "27.25": 5, "27.375": 5, "27.5": 5, "27.625": 5, "27.75": 5, "27.875": 5, "28": 5, "28.125": 5, "28.25": 5, "28.375": 5, "28.5": 5, "28.625": 5, "28.75": 5, "28.875": 5, "29": 5, "29.125": 5, "29.25": 5, "29.375": 5, "29.5": 5, "29.625": 5, "29.75": 5, "29.875": 5, "30": 5, "30.125": 5, "30.25": 5, "30.375": 5, "30.5": 5, "30.625": 5, "30.75": 5, "30.875": 5, "31": 5, "31.125": 5, "31.25": 5, "31.375": 5, "31.5": 5, "31.625": 5, "31.75": 5, "31.875": 5, "32": 5, "32.125": 5, "32.25": 5, "32.375": 5, "32.5": 5, "32.625": 5, "32.75": 5, "32.875": 5, "33": 5, "33.125": 5, "33.25": 5, "33.375": 5, "33.5": 5, "33.625": 5, "33.75": 5, "33.875": 5, "34": 6, "34.125": 6, "34.25": 6, "34.375": 6, "34.5": 6, "34.625": 6, "34.75": 6, "34.875": 6, "35": 6, "35.125": 6, "35.25": 6, "35.375": 6, "35.5": 6, "35.625": 6, "35.75": 6, "35.875": 6, "36": 6, "36.125": 6, "36.25": 6, "36.375": 6, "36.5": 6, "36.625": 6, "36.75": 6, "36.875": 6, "37": 6, "37.125": 6, "37.25": 6, "37.375": 6, "37.5": 6, "37.625": 6, "37.75": 6, "37.875": 6, "38": 6, "38.125": 6, "38.25": 6, "38.375": 6, "38.5": 6, "38.625": 6, "38.75": 6, "38.875": 6, "39": 6, "39.125": 6, "39.25": 6, "39.375": 6, "39.5": 6, "39.625": 6, "39.75": 6, "39.875": 6, "40": 7, "40.125": 7, "40.25": 7, "40.375": 7, "40.5": 7, "40.625": 7, "40.75": 7, "40.875": 7, "41": 7, "41.125": 7, "41.25": 7, "41.375": 7, "41.5": 7, "41.625": 7, "41.75": 7, "41.875": 7, "42": 7, "42.125": 7, "42.25": 7, "42.375": 7, "42.5": 7, "42.625": 7, "42.75": 7, "42.875": 7, "43": 7, "43.125": 7, "43.25": 7, "43.375": 7, "43.5": 7, "43.625": 7, "43.75": 7, "43.875": 7, "44": 7, "44.125": 7, "44.25": 7, "44.375": 7, "44.5": 7, "44.625": 7, "44.75": 7, "44.875": 7, "45": 7, "45.125": 7, "45.25": 7, "45.375": 7, "45.5": 7, "45.625": 7, "45.75": 7, "45.875": 7, "46": 8, "46.125": 8, "46.25": 8, "46.375": 8, "46.5": 8, "46.625": 8, "46.75": 8, "46.875": 8, "47": 8, "47.125": 8, "47.25": 8, "47.375": 8, "47.5": 8, "47.625": 8, "47.75": 8, "47.875": 8, "48": 8, "48.125": 8, "48.25": 8, "48.375": 8, "48.5": 8, "48.625": 8, "48.75": 8, "48.875": 8, "49": 8, "49.125": 8, "49.25": 8, "49.375": 8, "49.5": 8, "49.625": 8, "49.75": 8, "49.875": 8, "50": 8, "50.125": 8, "50.25": 8, "50.375": 8, "50.5": 8, "50.625": 8, "50.75": 8, "50.875": 8, "51": 8, "51.125": 8, "51.25": 8, "51.375": 8, "51.5": 8, "51.625": 8, "51.75": 8, "51.875": 8, "52": 8, "52.125": 8, "52.25": 8, "52.375": 8, "52.5": 8, "52.625": 8, "52.75": 8, "52.875": 8, "53": 9, "53.125": 9, "53.25": 9, "53.375": 9, "53.5": 9, "53.625": 9, "53.75": 9, "53.875": 9, "54": 9, "54.125": 9, "54.25": 9, "54.375": 9, "54.5": 9, "54.625": 9, "54.75": 9, "54.875": 9, "55": 9, "55.125": 9, "55.25": 9, "55.375": 9, "55.5": 9, "55.625": 9, "55.75": 9, "55.875": 9, "56": 9, "56.125": 9, "56.25": 9, "56.375": 9, "56.5": 9, "56.625": 9, "56.75": 9, "56.875": 9, "57": 9, "57.125": 9, "57.25": 9, "57.375": 9, "57.5": 9, "57.625": 9, "57.75": 9, "57.875": 9, "58": 9, "58.125": 9, "58.25": 9, "58.375": 9, "58.5": 9, "58.625": 9, "58.75": 9, "58.875": 9, "59": 9, "59.125": 9, "59.25": 9, "59.375": 9, "59.5": 9, "59.625": 9, "59.75": 9, "59.875": 9, "60": 9, "60.125": 9, "60.25": 9, "60.375": 9, "60.5": 9, "60.625": 9, "60.75": 9, "60.875": 9, "61": 10, "61.125": 10, "61.25": 10, "61.375": 10, "61.5": 10, "61.625": 10, "61.75": 10, "61.875": 10, "62": 10, "62.125": 10, "62.25": 10, "62.375": 10, "62.5": 10, "62.625": 10, "62.75": 10, "62.875": 10, "63": 10, "63.125": 10, "63.25": 10, "63.375": 10, "63.5": 10, "63.625": 10, "63.75": 10, "63.875": 10, "64": 10, "64.125": 10, "64.25": 10, "64.375": 10, "64.5": 10, "64.625": 10, "64.75": 10, "64.875": 10, "65": 10, "65.125": 10, "65.25": 10, "65.375": 10, "65.5": 10, "65.625": 10, "65.75": 10, "65.875": 10, "66": 10, "66.125": 10, "66.25": 10, "66.375": 10, "66.5": 10, "66.625": 10, "66.75": 10, "66.875": 10, "67": 10, "67.125": 10, "67.25": 10, "67.375": 10, "67.5": 10, "67.625": 10, "67.75": 10, "67.875": 10, "68": 11, "68.125": 11, "68.25": 11, "68.375": 11, "68.5": 11, "68.625": 11, "68.75": 11, "68.875": 11, "69": 11, "69.125": 11, "69.25": 11, "69.375": 11, "69.5": 11, "69.625": 11, "69.75": 11, "69.875": 11, "70": 11, "70.125": 11, "70.25": 11, "70.375": 11, "70.5": 11, "70.625": 11, "70.75": 11, "70.875": 11, "71": 11, "71.125": 11, "71.25": 11, "71.375": 11, "71.5": 11, "71.625": 11, "71.75": 11, "71.875": 11, "72": 11, "72.125": 11, "72.25": 11, "72.375": 11, "72.5": 11, "72.625": 11, "72.75": 11, "72.875": 11, "73": 11, "73.125": 11, "73.25": 11, "73.375": 11, "73.5": 11, "73.625": 11, "73.75": 11, "73.875": 11, "74": 11, "74.125": 11, "74.25": 11, "74.375": 11, "74.5": 11, "74.625": 11, "74.75": 11, "74.875": 11, "75": 12, "75.125": 12, "75.25": 12, "75.375": 12, "75.5": 12, "75.625": 12, "75.75": 12, "75.875": 12, "76": 12, "76.125": 12, "76.25": 12, "76.375": 12, "76.5": 12, "76.625": 12, "76.75": 12, "76.875": 12, "77": 12, "77.125": 12, "77.25": 12, "77.375": 12, "77.5": 12, "77.625": 12, "77.75": 12, "77.875": 12, "78": 12, "78.125": 12, "78.25": 12, "78.375": 12, "78.5": 12, "78.625": 12, "78.75": 12, "78.875": 12, "79": 12, "79.125": 12, "79.25": 12, "79.375": 12, "79.5": 12, "79.625": 12, "79.75": 12, "79.875": 12, "80": 12, "80.125": 12, "80.25": 12, "80.375": 12, "80.5": 12, "80.625": 12, "80.75": 12, "80.875": 12, "81": 12, "81.125": 12, "81.25": 12, "81.375": 12, "81.5": 12, "81.625": 12, "81.75": 12, "81.875": 12, "82": 13, "82.125": 13, "82.25": 13, "82.375": 13, "82.5": 13, "82.625": 13, "82.75": 13, "82.875": 13, "83": 13, "83.125": 13, "83.25": 13, "83.375": 13, "83.5": 13, "83.625": 13, "83.75": 13, "83.875": 13, "84": 13, "84.125": 13, "84.25": 13, "84.375": 13, "84.5": 13, "84.625": 13, "84.75": 13, "84.875": 13, "85": 13, "85.125": 13, "85.25": 13, "85.375": 13, "85.5": 13, "85.625": 13, "85.75": 13, "85.875": 13, "86": 13}, "\u5e73\u94fa\u6b3e\u65e0\u660e\u7ebf": {"24": 4, "24.125": 4, "24.25": 4, "24.375": 4, "24.5": 4, "24.625": 4, "24.75": 4, "24.875": 4, "25": 4, "25.125": 4, "25.25": 4, "25.375": 4, "25.5": 4, "25.625": 4, "25.75": 4, "25.875": 4, "26": 4, "26.125": 4, "26.25": 4, "26.375": 4, "26.5": 4, "26.625": 4, "26.75": 4, "26.875": 4, "27": 4, "27.125": 4, "27.25": 4, "27.375": 4, "27.5": 4, "27.625": 4, "27.75": 4, "27.875": 4, "28": 4, "28.125": 4, "28.25": 4, "28.375": 4, "28.5": 4, "28.625": 4, "28.75": 4, "28.875": 4, "29": 5, "29.125": 5, "29.25": 5, "29.375": 5, "29.5": 5, "29.625": 5, "29.75": 5, "29.875": 5, "30": 5, "30.125": 5, "30.25": 5, "30.375": 5, "30.5": 5, "30.625": 5, "30.75": 5, "30.875": 5, "31": 5, "31.125": 5, "31.25": 5, "31.375": 5, "31.5": 5, "31.625": 5, "31.75": 5, "31.875": 5, "32": 5, "32.125": 5, "32.25": 5, "32.375": 5, "32.5": 5, "32.625": 5, "32.75": 5, "32.875": 5, "33": 5, "33.125": 5, "33.25": 5, "33.375": 5, "33.5": 5, "33.625": 5, "33.75": 5, "33.875": 5, "34": 5, "34.125": 5, "34.25": 5, "34.375": 5, "34.5": 5, "34.625": 5, "34.75": 5, "34.875": 5, "35": 5, "35.125": 5, "35.25": 5, "35.375": 5, "35.5": 5, "35.625": 5, "35.75": 5, "35.875": 5, "36": 6, "36.125": 6, "36.25": 6, "36.375": 6, "36.5": 6, "36.625": 6, "36.75": 6, "36.875": 6, "37": 6, "37.125": 6, "37.25": 6, "37.375": 6, "37.5": 6, "37.625": 6, "37.75": 6, "37.875": 6, "38": 6, "38.125": 6, "38.25": 6, "38.375": 6, "38.5": 6, "38.625": 6, "38.75": 6, "38.875": 6, "39": 6, "39.125": 6, "39.25": 6, "39.375": 6, "39.5": 6, "39.625": 6, "39.75": 6, "39.875": 6, "40": 6, "40.125": 6, "40.25": 6, "40.375": 6, "40.5": 6, "40.625": 6, "40.75": 6, "40.875": 6, "41": 6, "41.125": 6, "41.25": 6, "41.375": 6, "41.5": 6, "41.625": 6, "41.75": 6, "41.875": 6, "42": 6, "42.125": 6, "42.25": 6, "42.375": 6, "42.5": 6, "42.625": 6, "42.75": 6, "42.875": 6, "43": 7, "43.125": 7, "43.25": 7, "43.375": 7, "43.5": 7, "43.625": 7, "43.75": 7, "43.875": 7, "44": 7, "44.125": 7, "44.25": 7, "44.375": 7, "44.5": 7, "44.625": 7, "44.75": 7, "44.875": 7, "45": 7, "45.125": 7, "45.25": 7, "45.375": 7, "45.5": 7, "45.625": 7, "45.75": 7, "45.875": 7, "46": 7, "46.125": 7, "46.25": 7, "46.375": 7, "46.5": 7, "46.625": 7, "46.75": 7, "46.875": 7, "47": 7, "47.125": 7, "47.25": 7, "47.375": 7, "47.5": 7, "47.625": 7, "47.75": 7, "47.875": 7, "48": 7, "48.125": 7, "48.25": 7, "48.375": 7, "48.5": 7, "48.625": 7, "48.75": 7, "48.875": 7, "49": 7, "49.125": 7, "49.25": 7, "49.375": 7, "49.5": 7, "49.625": 7, "49.75": 7, "49.875": 7, "50": 7, "50.125": 7, "50.25": 7, "50.375": 7, "50.5": 7, "50.625": 7, "50.75": 7, "50.875": 7, "51": 8, "51.125": 8, "51.25": 8, "51.375": 8, "51.5": 8, "51.625": 8, "51.75": 8, "51.875": 8, "52": 8, "52.125": 8, "52.25": 8, "52.375": 8, "52.5": 8, "52.625": 8, "52.75": 8, "52.875": 8, "53": 8, "53.125": 8, "53.25": 8, "53.375": 8, "53.5": 8, "53.625": 8, "53.75": 8, "53.875": 8, "54": 8, "54.125": 8, "54.25": 8, "54.375": 8, "54.5": 8, "54.625": 8, "54.75": 8, "54.875": 8, "55": 8, "55.125": 8, "55.25": 8, "55.375": 8, "55.5": 8, "55.625": 8, "55.75": 8, "55.875": 8, "56": 8, "56.125": 8, "56.25": 8, "56.375": 8, "56.5": 8, "56.625": 8, "56.75": 8, "56.875": 8, "57": 8, "57.125": 8, "57.25": 8, "57.375": 8, "57.5": 8, "57.625": 8, "57.75": 8, "57.875": 8, "58": 9, "58.125": 9, "58.25": 9, "58.375": 9, "58.5": 9, "58.625": 9, "58.75": 9, "58.875": 9, "59": 9, "59.125": 9, "59.25": 9, "59.375": 9, "59.5": 9, "59.625": 9, "59.75": 9, "59.875": 9, "60": 9, "60.125": 9, "60.25": 9, "60.375": 9, "60.5": 9, "60.625": 9, "60.75": 9, "60.875": 9, "61": 9, "61.125": 9, "61.25": 9, "61.375": 9, "61.5": 9, "61.625": 9, "61.75": 9, "61.875": 9, "62": 9, "62.125": 9, "62.25": 9, "62.375": 9, "62.5": 9, "62.625": 9, "62.75": 9, "62.875": 9, "63": 9, "63.125": 9, "63.25": 9, "63.375": 9, "63.5": 9, "63.625": 9, "63.75": 9, "63.875": 9, "64": 9, "64.125": 9, "64.25": 9, "64.375": 9, "64.5": 9, "64.625": 9, "64.75": 9, "64.875": 9, "65": 9, "65.125": 9, "65.25": 9, "65.375": 9, "65.5": 9, "65.625": 9, "65.75": 9, "65.875": 9, "66": 9, "66.125": 9, "66.25": 9, "66.375": 9, "66.5": 9, "66.625": 9, "66.75": 9, "66.875": 9, "67": 9, "67.125": 9, "67.25": 9, "67.375": 9, "67.5": 9, "67.625": 9, "67.75": 9, "67.875": 9, "68": 10, "68.125": 10, "68.25": 10, "68.375": 10, "68.5": 10, "68.625": 10, "68.75": 10, "68.875": 10, "69": 10, "69.125": 10, "69.25": 10, "69.375": 10, "69.5": 10, "69.625": 10, "69.75": 10, "69.875": 10, "70": 10, "70.125": 10, "70.25": 10, "70.375": 10, "70.5": 10, "70.625": 10, "70.75": 10, "70.875": 10, "71": 10, "71.125": 10, "71.25": 10, "71.375": 10, "71.5": 10, "71.625": 10, "71.75": 10, "71.875": 10, "72": 10, "72.125": 10, "72.25": 10, "72.375": 10, "72.5": 10, "72.625": 10, "72.75": 10, "72.875": 10, "73": 10, "73.125": 10, "73.25": 10, "73.375": 10, "73.5": 10, "73.625": 10, "73.75": 10, "73.875": 10, "74": 10, "74.125": 10, "74.25": 10, "74.375": 10, "74.5": 10, "74.625": 10, "74.75": 10, "74.875": 10, "75": 11, "75.125": 11, "75.25": 11, "75.375": 11, "75.5": 11, "75.625": 11, "75.75": 11, "75.875": 11, "76": 11, "76.125": 11, "76.25": 11, "76.375": 11, "76.5": 11, "76.625": 11, "76.75": 11, "76.875": 11, "77": 11, "77.125": 11, "77.25": 11, "77.375": 11, "77.5": 11, "77.625": 11, "77.75": 11, "77.875": 11, "78": 11, "78.125": 11, "78.25": 11, "78.375": 11, "78.5": 11, "78.625": 11, "78.75": 11, "78.875": 11, "79": 11, "79.125": 11, "79.25": 11, "79.375": 11, "79.5": 11, "79.625": 11, "79.75": 11, "79.875": 11, "80": 11, "80.125": 11, "80.25": 11, "80.375": 11, "80.5": 11, "80.625": 11, "80.75": 11, "80.875": 11, "81": 11, "81.125": 11, "81.25": 11, "81.375": 11, "81.5": 11, "81.625": 11, "81.75": 11, "81.875": 11, "82": 12, "82.125": 12, "82.25": 12, "82.375": 12, "82.5": 12, "82.625": 12, "82.75": 12, "82.875": 12, "83": 12, "83.125": 12, "83.25": 12, "83.375": 12, "83.5": 12, "83.625": 12, "83.75": 12, "83.875": 12, "84": 12, "84.125": 12, "84.25": 12, "84.375": 12, "84.5": 12, "84.625": 12, "84.75": 12, "84.875": 12, "85": 12, "85.125": 12, "85.25": 12, "85.375": 12, "85.5": 12, "85.625": 12, "85.75": 12, "85.875": 12, "86": 12, "86.125": 12, "86.25": 12, "86.375": 12, "86.5": 12, "86.625": 12, "86.75": 12, "86.875": 12, "87": 12, "87.125": 12, "87.25": 12, "87.375": 12, "87.5": 12, "87.625": 12, "87.75": 12, "87.875": 12, "88": 13, "88.125": 13, "88.25": 13, "88.375": 13, "88.5": 13, "88.625": 13, "88.75": 13, "88.875": 13, "89": 13, "89.125": 13, "89.25": 13, "89.375": 13, "89.5": 13, "89.625": 13, "89.75": 13, "89.875": 13, "90": 13, "90.125": 13, "90.25": 13, "90.375": 13, "90.5": 13, "90.625": 13, "90.75": 13, "90.875": 13, "91": 13, "91.125": 13, "91.25": 13, "91.375": 13, "91.5": 13, "91.625": 13, "91.75": 13, "91.875": 13, "92": 13, "92.125": 13, "92.25": 13, "92.375": 13, "92.5": 13, "92.625": 13, "92.75": 13, "92.875": 13, "93": 13, "93.125": 13, "93.25": 13, "93.375": 13, "93.5": 13, "93.625": 13, "93.75": 13, "93.875": 13, "94": 13, "94.125": 13, "94.25": 13, "94.375": 13, "94.5": 13, "94.625": 13, "94.75": 13, "94.875": 13, "95": 13, "95.125": 13, "95.25": 13, "95.375": 13, "95.5": 13, "95.625": 13, "95.75": 13, "95.875": 13, "96": 13}, "\u524d\u51f8\u540e\u51f8\u6b3e2.5cm": {"24": 4, "24.125": 4, "24.25": 4, "24.375": 4, "24.5": 4, "24.625": 4, "24.75": 4, "24.875": 4, "25": 4, "25.125": 4, "25.25": 4, "25.375": 4, "25.5": 4, "25.625": 4, "25.75": 4, "25.875": 4, "26": 4, "26.125": 4, "26.25": 4, "26.375": 4, "26.5": 4, "26.625": 4, "26.75": 4, "26.875": 4, "27": 4, "27.125": 4, "27.25": 4, "27.375": 4, "27.5": 4, "27.625": 4, "27.75": 4, "27.875": 4, "28": 4, "28.125": 4, "28.25": 4, "28.375": 4, "28.5": 4, "28.625": 4, "28.75": 4, "28.875": 4, "29": 5, "29.125": 5, "29.25": 5, "29.375": 5, "29.5": 5, "29.625": 5, "29.75": 5, "29.875": 5, "30": 5, "30.125": 5, "30.25": 5, "30.375": 5, "30.5": 5, "30.625": 5, "30.75": 5, "30.875": 5, "31": 5, "31.125": 5, "31.25": 5, "31.375": 5, "31.5": 5, "31.625": 5, "31.75": 5, "31.875": 5, "32": 5, "32.125": 5, "32.25": 5, "32.375": 5, "32.5": 5, "32.625": 5, "32.75": 5, "32.875": 5, "33": 5, "33.125": 5, "33.25": 5, "33.375": 5, "33.5": 5, "33.625": 5, "33.75": 5, "33.875": 5, "34": 5, "34.125": 5, "34.25": 5, "34.375": 5, "34.5": 5, "34.625": 5, "34.75": 5, "34.875": 5, "35": 5, "35.125": 5, "35.25": 5, "35.375": 5, "35.5": 5, "35.625": 5, "35.75": 5, "35.875": 5, "36": 6, "36.125": 6, "36.25": 6, "36.375": 6, "36.5": 6, "36.625": 6, "36.75": 6, "36.875": 6, "37": 6, "37.125": 6, "37.25": 6, "37.375": 6, "37.5": 6, "37.625": 6, "37.75": 6, "37.875": 6, "38": 6, "38.125": 6, "38.25": 6, "38.375": 6, "38.5": 6, "38.625": 6, "38.75": 6, "38.875": 6, "39": 6, "39.125": 6, "39.25": 6, "39.375": 6, "39.5": 6, "39.625": 6, "39.75": 6, "39.875": 6, "40": 6, "40.125": 6, "40.25": 6, "40.375": 6, "40.5": 6, "40.625": 6, "40.75": 6, "40.875": 6, "41": 6, "41.125": 6, "41.25": 6, "41.375": 6, "41.5": 6, "41.625": 6, "41.75": 6, "41.875": 6, "42": 6, "42.125": 6, "42.25": 6, "42.375": 6, "42.5": 6, "42.625": 6, "42.75": 6, "42.875": 6, "43": 7, "43.125": 7, "43.25": 7, "43.375": 7, "43.5": 7, "43.625": 7, "43.75": 7, "43.875": 7, "44": 7, "44.125": 7, "44.25": 7, "44.375": 7, "44.5": 7, "44.625": 7, "44.75": 7, "44.875": 7, "45": 7, "45.125": 7, "45.25": 7, "45.375": 7, "45.5": 7, "45.625": 7, "45.75": 7, "45.875": 7, "46": 7, "46.125": 7, "46.25": 7, "46.375": 7, "46.5": 7, "46.625": 7, "46.75": 7, "46.875": 7, "47": 7, "47.125": 7, "47.25": 7, "47.375": 7, "47.5": 7, "47.625": 7, "47.75": 7, "47.875": 7, "48": 7, "48.125": 7, "48.25": 7, "48.375": 7, "48.5": 7, "48.625": 7, "48.75": 7, "48.875": 7, "49": 7, "49.125": 7, "49.25": 7, "49.375": 7, "49.5": 7, "49.625": 7, "49.75": 7, "49.875": 7, "50": 7, "50.125": 7, "50.25": 7, "50.375": 7, "50.5": 7, "50.625": 7, "50.75": 7, "50.875": 7, "51": 8, "51.125": 8, "51.25": 8, "51.375": 8, "51.5": 8, "51.625": 8, "51.75": 8, "51.875": 8, "52": 8, "52.125": 8, "52.25": 8, "52.375": 8, "52.5": 8, "52.625": 8, "52.75": 8, "52.875": 8, "53": 8, "53.125": 8, "53.25": 8, "53.375": 8, "53.5": 8, "53.625": 8, "53.75": 8, "53.875": 8, "54": 8, "54.125": 8, "54.25": 8, "54.375": 8, "54.5": 8, "54.625": 8, "54.75": 8, "54.875": 8, "55": 8, "55.125": 8, "55.25": 8, "55.375": 8, "55.5": 8, "55.625": 8, "55.75": 8, "55.875": 8, "56": 8, "56.125": 8, "56.25": 8, "56.375": 8, "56.5": 8, "56.625": 8, "56.75": 8, "56.875": 8, "57": 8, "57.125": 8, "57.25": 8, "57.375": 8, "57.5": 8, "57.625": 8, "57.75": 8, "57.875": 8, "58": 9, "58.125": 9, "58.25": 9, "58.375": 9, "58.5": 9, "58.625": 9, "58.75": 9, "58.875": 9, "59": 9, "59.125": 9, "59.25": 9, "59.375": 9, "59.5": 9, "59.625": 9, "59.75": 9, "59.875": 9, "60": 9, "60.125": 9, "60.25": 9, "60.375": 9, "60.5": 9, "60.625": 9, "60.75": 9, "60.875": 9, "61": 9, "61.125": 9, "61.25": 9, "61.375": 9, "61.5": 9, "61.625": 9, "61.75": 9, "61.875": 9, "62": 9, "62.125": 9, "62.25": 9, "62.375": 9, "62.5": 9, "62.625": 9, "62.75": 9, "62.875": 9, "63": 9, "63.125": 9, "63.25": 9, "63.375": 9, "63.5": 9, "63.625": 9, "63.75": 9, "63.875": 9, "64": 9, "64.125": 9, "64.25": 9, "64.375": 9, "64.5": 9, "64.625": 9, "64.75": 9, "64.875": 9, "65": 9, "65.125": 9, "65.25": 9, "65.375": 9, "65.5": 9, "65.625": 9, "65.75": 9, "65.875": 9, "66": 9, "66.125": 9, "66.25": 9, "66.375": 9, "66.5": 9, "66.625": 9, "66.75": 9, "66.875": 9, "67": 10, "67.125": 10, "67.25": 10, "67.375": 10, "67.5": 10, "67.625": 10, "67.75": 10, "67.875": 10, "68": 10, "68.125": 10, "68.25": 10, "68.375": 10, "68.5": 10, "68.625": 10, "68.75": 10, "68.875": 10, "69": 10, "69.125": 10, "69.25": 10, "69.375": 10, "69.5": 10, "69.625": 10, "69.75": 10, "69.875": 10, "70": 10, "70.125": 10, "70.25": 10, "70.375": 10, "70.5": 10, "70.625": 10, "70.75": 10, "70.875": 10, "71": 10, "71.125": 10, "71.25": 10, "71.375": 10, "71.5": 10, "71.625": 10, "71.75": 10, "71.875": 10, "72": 10, "72.125": 10, "72.25": 10, "72.375": 10, "72.5": 10, "72.625": 10, "72.75": 10, "72.875": 10, "73": 10, "73.125": 10, "73.25": 10, "73.375": 10, "73.5": 10, "73.625": 10, "73.75": 10, "73.875": 10, "74": 10, "74.125": 10, "74.25": 10, "74.375": 10, "74.5": 10, "74.625": 10, "74.75": 10, "74.875": 10, "75": 11, "75.125": 11, "75.25": 11, "75.375": 11, "75.5": 11, "75.625": 11, "75.75": 11, "75.875": 11, "76": 11, "76.125": 11, "76.25": 11, "76.375": 11, "76.5": 11, "76.625": 11, "76.75": 11, "76.875": 11, "77": 11, "77.125": 11, "77.25": 11, "77.375": 11, "77.5": 11, "77.625": 11, "77.75": 11, "77.875": 11, "78": 11, "78.125": 11, "78.25": 11, "78.375": 11, "78.5": 11, "78.625": 11, "78.75": 11, "78.875": 11, "79": 11, "79.125": 11, "79.25": 11, "79.375": 11, "79.5": 11, "79.625": 11, "79.75": 11, "79.875": 11, "80": 11, "80.125": 11, "80.25": 11, "80.375": 11, "80.5": 11, "80.625": 11, "80.75": 11, "80.875": 11, "81": 11, "81.125": 11, "81.25": 11, "81.375": 11, "81.5": 11, "81.625": 11, "81.75": 11, "81.875": 11, "82": 12, "82.125": 12, "82.25": 12, "82.375": 12, "82.5": 12, "82.625": 12, "82.75": 12, "82.875": 12, "83": 12, "83.125": 12, "83.25": 12, "83.375": 12, "83.5": 12, "83.625": 12, "83.75": 12, "83.875": 12, "84": 12, "84.125": 12, "84.25": 12, "84.375": 12, "84.5": 12, "84.625": 12, "84.75": 12, "84.875": 12, "85": 12, "85.125": 12, "85.25": 12, "85.375": 12, "85.5": 12, "85.625": 12, "85.75": 12, "85.875": 12, "86": 12, "86.125": 12, "86.25": 12, "86.375": 12, "86.5": 12, "86.625": 12, "86.75": 12, "86.875": 12, "87": 12, "87.125": 12, "87.25": 12, "87.375": 12, "87.5": 12, "87.625": 12, "87.75": 12, "87.875": 12, "88": 13, "88.125": 13, "88.25": 13, "88.375": 13, "88.5": 13, "88.625": 13, "88.75": 13, "88.875": 13, "89": 13, "89.125": 13, "89.25": 13, "89.375": 13, "89.5": 13, "89.625": 13, "89.75": 13, "89.875": 13, "90": 13, "90.125": 13, "90.25": 13, "90.375": 13, "90.5": 13, "90.625": 13, "90.75": 13, "90.875": 13, "91": 13, "91.125": 13, "91.25": 13, "91.375": 13, "91.5": 13, "91.625": 13, "91.75": 13, "91.875": 13, "92": 13, "92.125": 13, "92.25": 13, "92.375": 13, "92.5": 13, "92.625": 13, "92.75": 13, "92.875": 13, "93": 13, "93.125": 13, "93.25": 13, "93.375": 13, "93.5": 13, "93.625": 13, "93.75": 13, "93.875": 13, "94": 13, "94.125": 13, "94.25": 13, "94.375": 13, "94.5": 13, "94.625": 13, "94.75": 13, "94.875": 13, "95": 13, "95.125": 13, "95.25": 13, "95.375": 13, "95.5": 13, "95.625": 13, "95.75": 13, "95.875": 13, "96": 13}, "\u4e0a\u4e0b\u5f00\u54082.5cm": {"24": 4, "24.125": 4, "24.25": 4, "24.375": 4, "24.5": 4, "24.625": 4, "24.75": 4, "24.875": 4, "25": 4, "25.125": 4, "25.25": 4, "25.375": 4, "25.5": 4, "25.625": 4, "25.75": 4, "25.875": 4, "26": 4, "26.125": 4, "26.25": 4, "26.375": 4, "26.5": 4, "26.625": 4, "26.75": 4, "26.875": 4, "27": 4, "27.125": 4, "27.25": 4, "27.375": 4, "27.5": 4, "27.625": 4, "27.75": 4, "27.875": 4, "28": 4, "28.125": 4, "28.25": 4, "28.375": 4, "28.5": 4, "28.625": 4, "28.75": 4, "28.875": 4, "29": 5, "29.125": 5, "29.25": 5, "29.375": 5, "29.5": 5, "29.625": 5, "29.75": 5, "29.875": 5, "30": 5, "30.125": 5, "30.25": 5, "30.375": 5, "30.5": 5, "30.625": 5, "30.75": 5, "30.875": 5, "31": 5, "31.125": 5, "31.25": 5, "31.375": 5, "31.5": 5, "31.625": 5, "31.75": 5, "31.875": 5, "32": 5, "32.125": 5, "32.25": 5, "32.375": 5, "32.5": 5, "32.625": 5, "32.75": 5, "32.875": 5, "33": 5, "33.125": 5, "33.25": 5, "33.375": 5, "33.5": 5, "33.625": 5, "33.75": 5, "33.875": 5, "34": 5, "34.125": 5, "34.25": 5, "34.375": 5, "34.5": 5, "34.625": 5, "34.75": 5, "34.875": 5, "35": 5, "35.125": 5, "35.25": 5, "35.375": 5, "35.5": 5, "35.625": 5, "35.75": 5, "35.875": 5, "36": 6, "36.125": 6, "36.25": 6, "36.375": 6, "36.5": 6, "36.625": 6, "36.75": 6, "36.875": 6, "37": 6, "37.125": 6, "37.25": 6, "37.375": 6, "37.5": 6, "37.625": 6, "37.75": 6, "37.875": 6, "38": 6, "38.125": 6, "38.25": 6, "38.375": 6, "38.5": 6, "38.625": 6, "38.75": 6, "38.875": 6, "39": 6, "39.125": 6, "39.25": 6, "39.375": 6, "39.5": 6, "39.625": 6, "39.75": 6, "39.875": 6, "40": 6, "40.125": 6, "40.25": 6, "40.375": 6, "40.5": 6, "40.625": 6, "40.75": 6, "40.875": 6, "41": 6, "41.125": 6, "41.25": 6, "41.375": 6, "41.5": 6, "41.625": 6, "41.75": 6, "41.875": 6, "42": 6, "42.125": 6, "42.25": 6, "42.375": 6, "42.5": 6, "42.625": 6, "42.75": 6, "42.875": 6, "43": 7, "43.125": 7, "43.25": 7, "43.375": 7, "43.5": 7, "43.625": 7, "43.75": 7, "43.875": 7, "44": 7, "44.125": 7, "44.25": 7, "44.375": 7, "44.5": 7, "44.625": 7, "44.75": 7, "44.875": 7, "45": 7, "45.125": 7, "45.25": 7, "45.375": 7, "45.5": 7, "45.625": 7, "45.75": 7, "45.875": 7, "46": 7, "46.125": 7, "46.25": 7, "46.375": 7, "46.5": 7, "46.625": 7, "46.75": 7, "46.875": 7, "47": 7, "47.125": 7, "47.25": 7, "47.375": 7, "47.5": 7, "47.625": 7, "47.75": 7, "47.875": 7, "48": 7, "48.125": 7, "48.25": 7, "48.375": 7, "48.5": 7, "48.625": 7, "48.75": 7, "48.875": 7, "49": 7, "49.125": 7, "49.25": 7, "49.375": 7, "49.5": 7, "49.625": 7, "49.75": 7, "49.875": 7, "50": 7, "50.125": 7, "50.25": 7, "50.375": 7, "50.5": 7, "50.625": 7, "50.75": 7, "50.875": 7, "51": 8, "51.125": 8, "51.25": 8, "51.375": 8, "51.5": 8, "51.625": 8, "51.75": 8, "51.875": 8, "52": 8, "52.125": 8, "52.25": 8, "52.375": 8, "52.5": 8, "52.625": 8, "52.75": 8, "52.875": 8, "53": 8, "53.125": 8, "53.25": 8, "53.375": 8, "53.5": 8, "53.625": 8, "53.75": 8, "53.875": 8, "54": 8, "54.125": 8, "54.25": 8, "54.375": 8, "54.5": 8, "54.625": 8, "54.75": 8, "54.875": 8, "55": 8, "55.125": 8, "55.25": 8, "55.375": 8, "55.5": 8, "55.625": 8, "55.75": 8, "55.875": 8, "56": 8, "56.125": 8, "56.25": 8, "56.375": 8, "56.5": 8, "56.625": 8, "56.75": 8, "56.875": 8, "57": 8, "57.125": 8, "57.25": 8, "57.375": 8, "57.5": 8, "57.625": 8, "57.75": 8, "57.875": 8, "58": 9, "58.125": 9, "58.25": 9, "58.375": 9, "58.5": 9, "58.625": 9, "58.75": 9, "58.875": 9, "59": 9, "59.125": 9, "59.25": 9, "59.375": 9, "59.5": 9, "59.625": 9, "59.75": 9, "59.875": 9, "60": 9, "60.125": 9, "60.25": 9, "60.375": 9, "60.5": 9, "60.625": 9, "60.75": 9, "60.875": 9, "61": 9, "61.125": 9, "61.25": 9, "61.375": 9, "61.5": 9, "61.625": 9, "61.75": 9, "61.875": 9, "62": 9, "62.125": 9, "62.25": 9, "62.375": 9, "62.5": 9, "62.625": 9, "62.75": 9, "62.875": 9, "63": 9, "63.125": 9, "63.25": 9, "63.375": 9, "63.5": 9, "63.625": 9, "63.75": 9, "63.875": 9, "64": 9, "64.125": 9, "64.25": 9, "64.375": 9, "64.5": 9, "64.625": 9, "64.75": 9, "64.875": 9, "65": 9, "65.125": 9, "65.25": 9, "65.375": 9, "65.5": 9, "65.625": 9, "65.75": 9, "65.875": 9, "66": 9, "66.125": 9, "66.25": 9, "66.375": 9, "66.5": 9, "66.625": 9, "66.75": 9, "66.875": 9, "67": 10, "67.125": 10, "67.25": 10, "67.375": 10, "67.5": 10, "67.625": 10, "67.75": 10, "67.875": 10, "68": 10, "68.125": 10, "68.25": 10, "68.375": 10, "68.5": 10, "68.625": 10, "68.75": 10, "68.875": 10, "69": 10, "69.125": 10, "69.25": 10, "69.375": 10, "69.5": 10, "69.625": 10, "69.75": 10, "69.875": 10, "70": 10, "70.125": 10, "70.25": 10, "70.375": 10, "70.5": 10, "70.625": 10, "70.75": 10, "70.875": 10, "71": 10, "71.125": 10, "71.25": 10, "71.375": 10, "71.5": 10, "71.625": 10, "71.75": 10, "71.875": 10, "72": 10, "72.125": 10, "72.25": 10, "72.375": 10, "72.5": 10, "72.625": 10, "72.75": 10, "72.875": 10, "73": 10, "73.125": 10, "73.25": 10, "73.375": 10, "73.5": 10, "73.625": 10, "73.75": 10, "73.875": 10, "74": 10, "74.125": 10, "74.25": 10, "74.375": 10, "74.5": 10, "74.625": 10, "74.75": 10, "74.875": 10, "75": 11, "75.125": 11, "75.25": 11, "75.375": 11, "75.5": 11, "75.625": 11, "75.75": 11, "75.875": 11, "76": 11, "76.125": 11, "76.25": 11, "76.375": 11, "76.5": 11, "76.625": 11, "76.75": 11, "76.875": 11, "77": 11, "77.125": 11, "77.25": 11, "77.375": 11, "77.5": 11, "77.625": 11, "77.75": 11, "77.875": 11, "78": 11, "78.125": 11, "78.25": 11, "78.375": 11, "78.5": 11, "78.625": 11, "78.75": 11, "78.875": 11, "79": 11, "79.125": 11, "79.25": 11, "79.375": 11, "79.5": 11, "79.625": 11, "79.75": 11, "79.875": 11, "80": 11, "80.125": 11, "80.25": 11, "80.375": 11, "80.5": 11, "80.625": 11, "80.75": 11, "80.875": 11, "81": 11, "81.125": 11, "81.25": 11, "81.375": 11, "81.5": 11, "81.625": 11, "81.75": 11, "81.875": 11, "82": 12, "82.125": 12, "82.25": 12, "82.375": 12, "82.5": 12, "82.625": 12, "82.75": 12, "82.875": 12, "83": 12, "83.125": 12, "83.25": 12, "83.375": 12, "83.5": 12, "83.625": 12, "83.75": 12, "83.875": 12, "84": 12, "84.125": 12, "84.25": 12, "84.375": 12, "84.5": 12, "84.625": 12, "84.75": 12, "84.875": 12, "85": 12, "85.125": 12, "85.25": 12, "85.375": 12, "85.5": 12, "85.625": 12, "85.75": 12, "85.875": 12, "86": 12, "86.125": 12, "86.25": 12, "86.375": 12, "86.5": 12, "86.625": 12, "86.75": 12, "86.875": 12, "87": 12, "87.125": 12, "87.25": 12, "87.375": 12, "87.5": 12, "87.625": 12, "87.75": 12, "87.875": 12, "88": 13, "88.125": 13, "88.25": 13, "88.375": 13, "88.5": 13, "88.625": 13, "88.75": 13, "88.875": 13, "89": 13, "89.125": 13, "89.25": 13, "89.375": 13, "89.5": 13, "89.625": 13, "89.75": 13, "89.875": 13, "90": 13, "90.125": 13, "90.25": 13, "90.375": 13, "90.5": 13, "90.625": 13, "90.75": 13, "90.875": 13, "91": 13, "91.125": 13, "91.25": 13, "91.375": 13, "91.5": 13, "91.625": 13, "91.75": 13, "91.875": 13, "92": 13, "92.125": 13, "92.25": 13, "92.375": 13, "92.5": 13, "92.625": 13, "92.75": 13, "92.875": 13, "93": 13, "93.125": 13, "93.25": 13, "93.375": 13, "93.5": 13, "93.625": 13, "93.75": 13, "93.875": 13, "94": 13, "94.125": 13, "94.25": 13, "94.375": 13, "94.5": 13, "94.625": 13, "94.75": 13, "94.875": 13, "95": 13, "95.125": 13, "95.25": 13, "95.375": 13, "95.5": 13, "95.625": 13, "95.75": 13, "95.875": 13, "96": 13}, "\u9c7c\u9cde\u6298\u53e0\u6b3e2.5cm": {"24": 4, "24.125": 4, "24.25": 4, "24.375": 4, "24.5": 4, "24.625": 4, "24.75": 4, "24.875": 4, "25": 4, "25.125": 4, "25.25": 4, "25.375": 4, "25.5": 4, "25.625": 4, "25.75": 4, "25.875": 4, "26": 4, "26.125": 4, "26.25": 4, "26.375": 4, "26.5": 4, "26.625": 4, "26.75": 4, "26.875": 4, "27": 5, "27.125": 5, "27.25": 5, "27.375": 5, "27.5": 5, "27.625": 5, "27.75": 5, "27.875": 5, "28": 5, "28.125": 5, "28.25": 5, "28.375": 5, "28.5": 5, "28.625": 5, "28.75": 5, "28.875": 5, "29": 5, "29.125": 5, "29.25": 5, "29.375": 5, "29.5": 5, "29.625": 5, "29.75": 5, "29.875": 5, "30": 5, "30.125": 5, "30.25": 5, "30.375": 5, "30.5": 5, "30.625": 5, "30.75": 5, "30.875": 5, "31": 5, "31.125": 5, "31.25": 5, "31.375": 5, "31.5": 5, "31.625": 5, "31.75": 5, "31.875": 5, "32": 5, "32.125": 5, "32.25": 5, "32.375": 5, "32.5": 5, "32.625": 5, "32.75": 5, "32.875": 5, "33": 5, "33.125": 5, "33.25": 5, "33.375": 5, "33.5": 5, "33.625": 5, "33.75": 5, "33.875": 5, "34": 6, "34.125": 6, "34.25": 6, "34.375": 6, "34.5": 6, "34.625": 6, "34.75": 6, "34.875": 6, "35": 6, "35.125": 6, "35.25": 6, "35.375": 6, "35.5": 6, "35.625": 6, "35.75": 6, "35.875": 6, "36": 6, "36.125": 6, "36.25": 6, "36.375": 6, "36.5": 6, "36.625": 6, "36.75": 6, "36.875": 6, "37": 6, "37.125": 6, "37.25": 6, "37.375": 6, "37.5": 6, "37.625": 6, "37.75": 6, "37.875": 6, "38": 6, "38.125": 6, "38.25": 6, "38.375": 6, "38.5": 6, "38.625": 6, "38.75": 6, "38.875": 6, "39": 6, "39.125": 6, "39.25": 6, "39.375": 6, "39.5": 6, "39.625": 6, "39.75": 6, "39.875": 6, "40": 7, "40.125": 7, "40.25": 7, "40.375": 7, "40.5": 7, "40.625": 7, "40.75": 7, "40.875": 7, "41": 7, "41.125": 7, "41.25": 7, "41.375": 7, "41.5": 7, "41.625": 7, "41.75": 7, "41.875": 7, "42": 7, "42.125": 7, "42.25": 7, "42.375": 7, "42.5": 7, "42.625": 7, "42.75": 7, "42.875": 7, "43": 7, "43.125": 7, "43.25": 7, "43.375": 7, "43.5": 7, "43.625": 7, "43.75": 7, "43.875": 7, "44": 7, "44.125": 7, "44.25": 7, "44.375": 7, "44.5": 7, "44.625": 7, "44.75": 7, "44.875": 7, "45": 7, "45.125": 7, "45.25": 7, "45.375": 7, "45.5": 7, "45.625": 7, "45.75": 7, "45.875": 7, "46": 8, "46.125": 8, "46.25": 8, "46.375": 8, "46.5": 8, "46.625": 8, "46.75": 8, "46.875": 8, "47": 8, "47.125": 8, "47.25": 8, "47.375": 8, "47.5": 8, "47.625": 8, "47.75": 8, "47.875": 8, "48": 8, "48.125": 8, "48.25": 8, "48.375": 8, "48.5": 8, "48.625": 8, "48.75": 8, "48.875": 8, "49": 8, "49.125": 8, "49.25": 8, "49.375": 8, "49.5": 8, "49.625": 8, "49.75": 8, "49.875": 8, "50": 8, "50.125": 8, "50.25": 8, "50.375": 8, "50.5": 8, "50.625": 8, "50.75": 8, "50.875": 8, "51": 8, "51.125": 8, "51.25": 8, "51.375": 8, "51.5": 8, "51.625": 8, "51.75": 8, "51.875": 8, "52": 8, "52.125": 8, "52.25": 8, "52.375": 8, "52.5": 8, "52.625": 8, "52.75": 8, "52.875": 8, "53": 9, "53.125": 9, "53.25": 9, "53.375": 9, "53.5": 9, "53.625": 9, "53.75": 9, "53.875": 9, "54": 9, "54.125": 9, "54.25": 9, "54.375": 9, "54.5": 9, "54.625": 9, "54.75": 9, "54.875": 9, "55": 9, "55.125": 9, "55.25": 9, "55.375": 9, "55.5": 9, "55.625": 9, "55.75": 9, "55.875": 9, "56": 9, "56.125": 9, "56.25": 9, "56.375": 9, "56.5": 9, "56.625": 9, "56.75": 9, "56.875": 9, "57": 9, "57.125": 9, "57.25": 9, "57.375": 9, "57.5": 9, "57.625": 9, "57.75": 9, "57.875": 9, "58": 9, "58.125": 9, "58.25": 9, "58.375": 9, "58.5": 9, "58.625": 9, "58.75": 9, "58.875": 9, "59": 9, "59.125": 9, "59.25": 9, "59.375": 9, "59.5": 9, "59.625": 9, "59.75": 9, "59.875": 9, "60": 9, "60.125": 9, "60.25": 9, "60.375": 9, "60.5": 9, "60.625": 9, "60.75": 9, "60.875": 9, "61": 10, "61.125": 10, "61.25": 10, "61.375": 10, "61.5": 10, "61.625": 10, "61.75": 10, "61.875": 10, "62": 10, "62.125": 10, "62.25": 10, "62.375": 10, "62.5": 10, "62.625": 10, "62.75": 10, "62.875": 10, "63": 10, "63.125": 10, "63.25": 10, "63.375": 10, "63.5": 10, "63.625": 10, "63.75": 10, "63.875": 10, "64": 10, "64.125": 10, "64.25": 10, "64.375": 10, "64.5": 10, "64.625": 10, "64.75": 10, "64.875": 10, "65": 10, "65.125": 10, "65.25": 10, "65.375": 10, "65.5": 10, "65.625": 10, "65.75": 10, "65.875": 10, "66": 10, "66.125": 10, "66.25": 10, "66.375": 10, "66.5": 10, "66.625": 10, "66.75": 10, "66.875": 10, "67": 10, "67.125": 10, "67.25": 10, "67.375": 10, "67.5": 10, "67.625": 10, "67.75": 10, "67.875": 10, "68": 11, "68.125": 11, "68.25": 11, "68.375": 11, "68.5": 11, "68.625": 11, "68.75": 11, "68.875": 11, "69": 11, "69.125": 11, "69.25": 11, "69.375": 11, "69.5": 11, "69.625": 11, "69.75": 11, "69.875": 11, "70": 11, "70.125": 11, "70.25": 11, "70.375": 11, "70.5": 11, "70.625": 11, "70.75": 11, "70.875": 11, "71": 11, "71.125": 11, "71.25": 11, "71.375": 11, "71.5": 11, "71.625": 11, "71.75": 11, "71.875": 11, "72": 11, "72.125": 11, "72.25": 11, "72.375": 11, "72.5": 11, "72.625": 11, "72.75": 11, "72.875": 11, "73": 11, "73.125": 11, "73.25": 11, "73.375": 11, "73.5": 11, "73.625": 11, "73.75": 11, "73.875": 11, "74": 11, "74.125": 11, "74.25": 11, "74.375": 11, "74.5": 11, "74.625": 11, "74.75": 11, "74.875": 11, "75": 12, "75.125": 12, "75.25": 12, "75.375": 12, "75.5": 12, "75.625": 12, "75.75": 12, "75.875": 12, "76": 12, "76.125": 12, "76.25": 12, "76.375": 12, "76.5": 12, "76.625": 12, "76.75": 12, "76.875": 12, "77": 12, "77.125": 12, "77.25": 12, "77.375": 12, "77.5": 12, "77.625": 12, "77.75": 12, "77.875": 12, "78": 12, "78.125": 12, "78.25": 12, "78.375": 12, "78.5": 12, "78.625": 12, "78.75": 12, "78.875": 12, "79": 12, "79.125": 12, "79.25": 12, "79.375": 12, "79.5": 12, "79.625": 12, "79.75": 12, "79.875": 12, "80": 12, "80.125": 12, "80.25": 12, "80.375": 12, "80.5": 12, "80.625": 12, "80.75": 12, "80.875": 12, "81": 12, "81.125": 12, "81.25": 12, "81.375": 12, "81.5": 12, "81.625": 12, "81.75": 12, "81.875": 12, "82": 13, "82.125": 13, "82.25": 13, "82.375": 13, "82.5": 13, "82.625": 13, "82.75": 13, "82.875": 13, "83": 13, "83.125": 13, "83.25": 13, "83.375": 13, "83.5": 13, "83.625": 13, "83.75": 13, "83.875": 13, "84": 13, "84.125": 13, "84.25": 13, "84.375": 13, "84.5": 13, "84.625": 13, "84.75": 13, "84.875": 13, "85": 13, "85.125": 13, "85.25": 13, "85.375": 13, "85.5": 13, "85.625": 13, "85.75": 13, "85.875": 13, "86": 13}, "\u67d4\u7eb1\u6b3e2.5cm": {"24": 4, "24.125": 4, "24.25": 4, "24.375": 4, "24.5": 4, "24.625": 4, "24.75": 4, "24.875": 4, "25": 4, "25.125": 4, "25.25": 4, "25.375": 4, "25.5": 4, "25.625": 4, "25.75": 4, "25.875": 4, "26": 4, "26.125": 4, "26.25": 4, "26.375": 4, "26.5": 4, "26.625": 4, "26.75": 4, "26.875": 4, "27": 5, "27.125": 5, "27.25": 5, "27.375": 5, "27.5": 5, "27.625": 5, "27.75": 5, "27.875": 5, "28": 5, "28.125": 5, "28.25": 5, "28.375": 5, "28.5": 5, "28.625": 5, "28.75": 5, "28.875": 5, "29": 5, "29.125": 5, "29.25": 5, "29.375": 5, "29.5": 5, "29.625": 5, "29.75": 5, "29.875": 5, "30": 5, "30.125": 5, "30.25": 5, "30.375": 5, "30.5": 5, "30.625": 5, "30.75": 5, "30.875": 5, "31": 5, "31.125": 5, "31.25": 5, "31.375": 5, "31.5": 5, "31.625": 5, "31.75": 5, "31.875": 5, "32": 5, "32.125": 5, "32.25": 5, "32.375": 5, "32.5": 5, "32.625": 5, "32.75": 5, "32.875": 5, "33": 5, "33.125": 5, "33.25": 5, "33.375": 5, "33.5": 5, "33.625": 5, "33.75": 5, "33.875": 5, "34": 6, "34.125": 6, "34.25": 6, "34.375": 6, "34.5": 6, "34.625": 6, "34.75": 6, "34.875": 6, "35": 6, "35.125": 6, "35.25": 6, "35.375": 6, "35.5": 6, "35.625": 6, "35.75": 6, "35.875": 6, "36": 6, "36.125": 6, "36.25": 6, "36.375": 6, "36.5": 6, "36.625": 6, "36.75": 6, "36.875": 6, "37": 6, "37.125": 6, "37.25": 6, "37.375": 6, "37.5": 6, "37.625": 6, "37.75": 6, "37.875": 6, "38": 6, "38.125": 6, "38.25": 6, "38.375": 6, "38.5": 6, "38.625": 6, "38.75": 6, "38.875": 6, "39": 6, "39.125": 6, "39.25": 6, "39.375": 6, "39.5": 6, "39.625": 6, "39.75": 6, "39.875": 6, "40": 7, "40.125": 7, "40.25": 7, "40.375": 7, "40.5": 7, "40.625": 7, "40.75": 7, "40.875": 7, "41": 7, "41.125": 7, "41.25": 7, "41.375": 7, "41.5": 7, "41.625": 7, "41.75": 7, "41.875": 7, "42": 7, "42.125": 7, "42.25": 7, "42.375": 7, "42.5": 7, "42.625": 7, "42.75": 7, "42.875": 7, "43": 7, "43.125": 7, "43.25": 7, "43.375": 7, "43.5": 7, "43.625": 7, "43.75": 7, "43.875": 7, "44": 7, "44.125": 7, "44.25": 7, "44.375": 7, "44.5": 7, "44.625": 7, "44.75": 7, "44.875": 7, "45": 7, "45.125": 7, "45.25": 7, "45.375": 7, "45.5": 7, "45.625": 7, "45.75": 7, "45.875": 7, "46": 7, "46.125": 7, "46.25": 7, "46.375": 7, "46.5": 7, "46.625": 7, "46.75": 7, "46.875": 7, "47": 8, "47.125": 8, "47.25": 8, "47.375": 8, "47.5": 8, "47.625": 8, "47.75": 8, "47.875": 8, "48": 8, "48.125": 8, "48.25": 8, "48.375": 8, "48.5": 8, "48.625": 8, "48.75": 8, "48.875": 8, "49": 8, "49.125": 8, "49.25": 8, "49.375": 8, "49.5": 8, "49.625": 8, "49.75": 8, "49.875": 8, "50": 8, "50.125": 8, "50.25": 8, "50.375": 8, "50.5": 8, "50.625": 8, "50.75": 8, "50.875": 8, "51": 8, "51.125": 8, "51.25": 8, "51.375": 8, "51.5": 8, "51.625": 8, "51.75": 8, "51.875": 8, "52": 8, "52.125": 8, "52.25": 8, "52.375": 8, "52.5": 8, "52.625": 8, "52.75": 8, "52.875": 8, "53": 9, "53.125": 9, "53.25": 9, "53.375": 9, "53.5": 9, "53.625": 9, "53.75": 9, "53.875": 9, "54": 9, "54.125": 9, "54.25": 9, "54.375": 9, "54.5": 9, "54.625": 9, "54.75": 9, "54.875": 9, "55": 9, "55.125": 9, "55.25": 9, "55.375": 9, "55.5": 9, "55.625": 9, "55.75": 9, "55.875": 9, "56": 9, "56.125": 9, "56.25": 9, "56.375": 9, "56.5": 9, "56.625": 9, "56.75": 9, "56.875": 9, "57": 9, "57.125": 9, "57.25": 9, "57.375": 9, "57.5": 9, "57.625": 9, "57.75": 9, "57.875": 9, "58": 9, "58.125": 9, "58.25": 9, "58.375": 9, "58.5": 9, "58.625": 9, "58.75": 9, "58.875": 9, "59": 9, "59.125": 9, "59.25": 9, "59.375": 9, "59.5": 9, "59.625": 9, "59.75": 9, "59.875": 9, "60": 9, "60.125": 9, "60.25": 9, "60.375": 9, "60.5": 9, "60.625": 9, "60.75": 9, "60.875": 9, "61": 10, "61.125": 10, "61.25": 10, "61.375": 10, "61.5": 10, "61.625": 10, "61.75": 10, "61.875": 10, "62": 10, "62.125": 10, "62.25": 10, "62.375": 10, "62.5": 10, "62.625": 10, "62.75": 10, "62.875": 10, "63": 10, "63.125": 10, "63.25": 10, "63.375": 10, "63.5": 10, "63.625": 10, "63.75": 10, "63.875": 10, "64": 10, "64.125": 10, "64.25": 10, "64.375": 10, "64.5": 10, "64.625": 10, "64.75": 10, "64.875": 10, "65": 10, "65.125": 10, "65.25": 10, "65.375": 10, "65.5": 10, "65.625": 10, "65.75": 10, "65.875": 10, "66": 10, "66.125": 10, "66.25": 10, "66.375": 10, "66.5": 10, "66.625": 10, "66.75": 10, "66.875": 10, "67": 10, "67.125": 10, "67.25": 10, "67.375": 10, "67.5": 10, "67.625": 10, "67.75": 10, "67.875": 10, "68": 11, "68.125": 11, "68.25": 11, "68.375": 11, "68.5": 11, "68.625": 11, "68.75": 11, "68.875": 11, "69": 11, "69.125": 11, "69.25": 11, "69.375": 11, "69.5": 11, "69.625": 11, "69.75": 11, "69.875": 11, "70": 11, "70.125": 11, "70.25": 11, "70.375": 11, "70.5": 11, "70.625": 11, "70.75": 11, "70.875": 11, "71": 11, "71.125": 11, "71.25": 11, "71.375": 11, "71.5": 11, "71.625": 11, "71.75": 11, "71.875": 11, "72": 11, "72.125": 11, "72.25": 11, "72.375": 11, "72.5": 11, "72.625": 11, "72.75": 11, "72.875": 11, "73": 11, "73.125": 11, "73.25": 11, "73.375": 11, "73.5": 11, "73.625": 11, "73.75": 11, "73.875": 11, "74": 11, "74.125": 11, "74.25": 11, "74.375": 11, "74.5": 11, "74.625": 11, "74.75": 11, "74.875": 11, "75": 12, "75.125": 12, "75.25": 12, "75.375": 12, "75.5": 12, "75.625": 12, "75.75": 12, "75.875": 12, "76": 12, "76.125": 12, "76.25": 12, "76.375": 12, "76.5": 12, "76.625": 12, "76.75": 12, "76.875": 12, "77": 12, "77.125": 12, "77.25": 12, "77.375": 12, "77.5": 12, "77.625": 12, "77.75": 12, "77.875": 12, "78": 12, "78.125": 12, "78.25": 12, "78.375": 12, "78.5": 12, "78.625": 12, "78.75": 12, "78.875": 12, "79": 12, "79.125": 12, "79.25": 12, "79.375": 12, "79.5": 12, "79.625": 12, "79.75": 12, "79.875": 12, "80": 12, "80.125": 12, "80.25": 12, "80.375": 12, "80.5": 12, "80.625": 12, "80.75": 12, "80.875": 12, "81": 12, "81.125": 12, "81.25": 12, "81.375": 12, "81.5": 12, "81.625": 12, "81.75": 12, "81.875": 12, "82": 13, "82.125": 13, "82.25": 13, "82.375": 13, "82.5": 13, "82.625": 13, "82.75": 13, "82.875": 13, "83": 13, "83.125": 13, "83.25": 13, "83.375": 13, "83.5": 13, "83.625": 13, "83.75": 13, "83.875": 13, "84": 13, "84.125": 13, "84.25": 13, "84.375": 13, "84.5": 13, "84.625": 13, "84.75": 13, "84.875": 13, "85": 13, "85.125": 13, "85.25": 13, "85.375": 13, "85.5": 13, "85.625": 13, "85.75": 13, "85.875": 13, "86": 13}, "\u4e0a\u4e0b\u5f00\u5408\u67d4\u7eb1\u6b3e2.5cm": {"24": 4, "24.125": 4, "24.25": 4, "24.375": 4, "24.5": 4, "24.625": 4, "24.75": 4, "24.875": 4, "25": 4, "25.125": 4, "25.25": 4, "25.375": 4, "25.5": 4, "25.625": 4, "25.75": 4, "25.875": 4, "26": 4, "26.125": 4, "26.25": 4, "26.375": 4, "26.5": 4, "26.625": 4, "26.75": 4, "26.875": 4, "27": 5, "27.125": 5, "27.25": 5, "27.375": 5, "27.5": 5, "27.625": 5, "27.75": 5, "27.875": 5, "28": 5, "28.125": 5, "28.25": 5, "28.375": 5, "28.5": 5, "28.625": 5, "28.75": 5, "28.875": 5, "29": 5, "29.125": 5, "29.25": 5, "29.375": 5, "29.5": 5, "29.625": 5, "29.75": 5, "29.875": 5, "30": 5, "30.125": 5, "30.25": 5, "30.375": 5, "30.5": 5, "30.625": 5, "30.75": 5, "30.875": 5, "31": 5, "31.125": 5, "31.25": 5, "31.375": 5, "31.5": 5, "31.625": 5, "31.75": 5, "31.875": 5, "32": 5, "32.125": 5, "32.25": 5, "32.375": 5, "32.5": 5, "32.625": 5, "32.75": 5, "32.875": 5, "33": 5, "33.125": 5, "33.25": 5, "33.375": 5, "33.5": 5, "33.625": 5, "33.75": 5, "33.875": 5, "34": 6, "34.125": 6, "34.25": 6, "34.375": 6, "34.5": 6, "34.625": 6, "34.75": 6, "34.875": 6, "35": 6, "35.125": 6, "35.25": 6, "35.375": 6, "35.5": 6, "35.625": 6, "35.75": 6, "35.875": 6, "36": 6, "36.125": 6, "36.25": 6, "36.375": 6, "36.5": 6, "36.625": 6, "36.75": 6, "36.875": 6, "37": 6, "37.125": 6, "37.25": 6, "37.375": 6, "37.5": 6, "37.625": 6, "37.75": 6, "37.875": 6, "38": 6, "38.125": 6, "38.25": 6, "38.375": 6, "38.5": 6, "38.625": 6, "38.75": 6, "38.875": 6, "39": 6, "39.125": 6, "39.25": 6, "39.375": 6, "39.5": 6, "39.625": 6, "39.75": 6, "39.875": 6, "40": 7, "40.125": 7, "40.25": 7, "40.375": 7, "40.5": 7, "40.625": 7, "40.75": 7, "40.875": 7, "41": 7, "41.125": 7, "41.25": 7, "41.375": 7, "41.5": 7, "41.625": 7, "41.75": 7, "41.875": 7, "42": 7, "42.125": 7, "42.25": 7, "42.375": 7, "42.5": 7, "42.625": 7, "42.75": 7, "42.875": 7, "43": 7, "43.125": 7, "43.25": 7, "43.375": 7, "43.5": 7, "43.625": 7, "43.75": 7, "43.875": 7, "44": 7, "44.125": 7, "44.25": 7, "44.375": 7, "44.5": 7, "44.625": 7, "44.75": 7, "44.875": 7, "45": 7, "45.125": 7, "45.25": 7, "45.375": 7, "45.5": 7, "45.625": 7, "45.75": 7, "45.875": 7, "46": 7, "46.125": 7, "46.25": 7, "46.375": 7, "46.5": 7, "46.625": 7, "46.75": 7, "46.875": 7, "47": 8, "47.125": 8, "47.25": 8, "47.375": 8, "47.5": 8, "47.625": 8, "47.75": 8, "47.875": 8, "48": 8, "48.125": 8, "48.25": 8, "48.375": 8, "48.5": 8, "48.625": 8, "48.75": 8, "48.875": 8, "49": 8, "49.125": 8, "49.25": 8, "49.375": 8, "49.5": 8, "49.625": 8, "49.75": 8, "49.875": 8, "50": 8, "50.125": 8, "50.25": 8, "50.375": 8, "50.5": 8, "50.625": 8, "50.75": 8, "50.875": 8, "51": 8, "51.125": 8, "51.25": 8, "51.375": 8, "51.5": 8, "51.625": 8, "51.75": 8, "51.875": 8, "52": 8, "52.125": 8, "52.25": 8, "52.375": 8, "52.5": 8, "52.625": 8, "52.75": 8, "52.875": 8, "53": 9, "53.125": 9, "53.25": 9, "53.375": 9, "53.5": 9, "53.625": 9, "53.75": 9, "53.875": 9, "54": 9, "54.125": 9, "54.25": 9, "54.375": 9, "54.5": 9, "54.625": 9, "54.75": 9, "54.875": 9, "55": 9, "55.125": 9, "55.25": 9, "55.375": 9, "55.5": 9, "55.625": 9, "55.75": 9, "55.875": 9, "56": 9, "56.125": 9, "56.25": 9, "56.375": 9, "56.5": 9, "56.625": 9, "56.75": 9, "56.875": 9, "57": 9, "57.125": 9, "57.25": 9, "57.375": 9, "57.5": 9, "57.625": 9, "57.75": 9, "57.875": 9, "58": 9, "58.125": 9, "58.25": 9, "58.375": 9, "58.5": 9, "58.625": 9, "58.75": 9, "58.875": 9, "59": 9, "59.125": 9, "59.25": 9, "59.375": 9, "59.5": 9, "59.625": 9, "59.75": 9, "59.875": 9, "60": 9, "60.125": 9, "60.25": 9, "60.375": 9, "60.5": 9, "60.625": 9, "60.75": 9, "60.875": 9, "61": 10, "61.125": 10, "61.25": 10, "61.375": 10, "61.5": 10, "61.625": 10, "61.75": 10, "61.875": 10, "62": 10, "62.125": 10, "62.25": 10, "62.375": 10, "62.5": 10, "62.625": 10, "62.75": 10, "62.875": 10, "63": 10, "63.125": 10, "63.25": 10, "63.375": 10, "63.5": 10, "63.625": 10, "63.75": 10, "63.875": 10, "64": 10, "64.125": 10, "64.25": 10, "64.375": 10, "64.5": 10, "64.625": 10, "64.75": 10, "64.875": 10, "65": 10, "65.125": 10, "65.25": 10, "65.375": 10, "65.5": 10, "65.625": 10, "65.75": 10, "65.875": 10, "66": 10, "66.125": 10, "66.25": 10, "66.375": 10, "66.5": 10, "66.625": 10, "66.75": 10, "66.875": 10, "67": 10, "67.125": 10, "67.25": 10, "67.375": 10, "67.5": 10, "67.625": 10, "67.75": 10, "67.875": 10, "68": 11, "68.125": 11, "68.25": 11, "68.375": 11, "68.5": 11, "68.625": 11, "68.75": 11, "68.875": 11, "69": 11, "69.125": 11, "69.25": 11, "69.375": 11, "69.5": 11, "69.625": 11, "69.75": 11, "69.875": 11, "70": 11, "70.125": 11, "70.25": 11, "70.375": 11, "70.5": 11, "70.625": 11, "70.75": 11, "70.875": 11, "71": 11, "71.125": 11, "71.25": 11, "71.375": 11, "71.5": 11, "71.625": 11, "71.75": 11, "71.875": 11, "72": 11, "72.125": 11, "72.25": 11, "72.375": 11, "72.5": 11, "72.625": 11, "72.75": 11, "72.875": 11, "73": 11, "73.125": 11, "73.25": 11, "73.375": 11, "73.5": 11, "73.625": 11, "73.75": 11, "73.875": 11, "74": 11, "74.125": 11, "74.25": 11, "74.375": 11, "74.5": 11, "74.625": 11, "74.75": 11, "74.875": 11, "75": 12, "75.125": 12, "75.25": 12, "75.375": 12, "75.5": 12, "75.625": 12, "75.75": 12, "75.875": 12, "76": 12, "76.125": 12, "76.25": 12, "76.375": 12, "76.5": 12, "76.625": 12, "76.75": 12, "76.875": 12, "77": 12, "77.125": 12, "77.25": 12, "77.375": 12, "77.5": 12, "77.625": 12, "77.75": 12, "77.875": 12, "78": 12, "78.125": 12, "78.25": 12, "78.375": 12, "78.5": 12, "78.625": 12, "78.75": 12, "78.875": 12, "79": 12, "79.125": 12, "79.25": 12, "79.375": 12, "79.5": 12, "79.625": 12, "79.75": 12, "79.875": 12, "80": 12, "80.125": 12, "80.25": 12, "80.375": 12, "80.5": 12, "80.625": 12, "80.75": 12, "80.875": 12, "81": 13, "81.125": 13, "81.25": 13, "81.375": 13, "81.5": 13, "81.625": 13, "81.75": 13, "81.875": 13, "82": 13, "82.125": 13, "82.25": 13, "82.375": 13, "82.5": 13, "82.625": 13, "82.75": 13, "82.875": 13, "83": 13, "83.125": 13, "83.25": 13, "83.375": 13, "83.5": 13, "83.625": 13, "83.75": 13, "83.875": 13, "84": 13, "84.125": 13, "84.25": 13, "84.375": 13, "84.5": 13, "84.625": 13, "84.75": 13, "84.875": 13, "85": 13, "85.125": 13, "85.25": 13, "85.375": 13, "85.5": 13, "85.625": 13, "85.75": 13, "85.875": 13, "86": 13}};
const DRAPERY_FABRIC_DB = {"pinch_4_single": [{"width": 1.2, "hooks": 14, "fabric": 3.62}, {"width": 1.3, "hooks": 15, "fabric": 3.85}, {"width": 1.4, "hooks": 16, "fabric": 4.08}, {"width": 1.65, "hooks": 18, "fabric": 4.655}, {"width": 1.85, "hooks": 20, "fabric": 5.115}, {"width": 2.05, "hooks": 22, "fabric": 5.575}, {"width": 2.25, "hooks": 24, "fabric": 6.035}, {"width": 2.45, "hooks": 26, "fabric": 6.495}, {"width": 2.65, "hooks": 28, "fabric": 6.955}, {"width": 2.85, "hooks": 30, "fabric": 7.415}, {"width": 3.05, "hooks": 32, "fabric": 7.875}, {"width": 3.25, "hooks": 34, "fabric": 8.335}, {"width": 3.45, "hooks": 36, "fabric": 8.795}, {"width": 3.66, "hooks": 38, "fabric": 9.278}, {"width": 3.87, "hooks": 40, "fabric": 9.761}, {"width": 4.08, "hooks": 42, "fabric": 10.244}, {"width": 4.29, "hooks": 44, "fabric": 10.727}, {"width": 4.47, "hooks": 46, "fabric": 11.141}, {"width": 4.68, "hooks": 48, "fabric": 11.624}, {"width": 4.88, "hooks": 50, "fabric": 12.084}, {"width": 5.1, "hooks": 53, "fabric": 12.59}, {"width": 5.3, "hooks": 55, "fabric": 13.05}, {"width": 5.5, "hooks": 57, "fabric": 13.51}, {"width": 5.7, "hooks": 59, "fabric": 13.97}, {"width": 5.9, "hooks": 61, "fabric": 14.43}, {"width": 6.1, "hooks": 63, "fabric": 14.89}, {"width": 6.3, "hooks": 65, "fabric": 15.35}, {"width": 6.5, "hooks": 67, "fabric": 15.81}, {"width": 6.71, "hooks": 69, "fabric": 16.293}, {"width": 6.91, "hooks": 71, "fabric": 16.753}, {"width": 7.11, "hooks": 73, "fabric": 17.213}, {"width": 7.32, "hooks": 75, "fabric": 17.696}, {"width": 7.52, "hooks": 77, "fabric": 18.156}, {"width": 7.73, "hooks": 79, "fabric": 18.639}, {"width": 7.94, "hooks": 81, "fabric": 19.122}, {"width": 8.14, "hooks": 83, "fabric": 19.582}, {"width": 8.34, "hooks": 85, "fabric": 20.042}, {"width": 8.54, "hooks": 87, "fabric": 20.502}, {"width": 8.74, "hooks": 89, "fabric": 20.962}, {"width": 8.94, "hooks": 91, "fabric": 21.422}], "pinch_4_pair": [{"width": 1.2, "hooks_per_panel": 8, "fabric": 4.28}, {"width": 1.3, "hooks_per_panel": 8, "fabric": 4.51}, {"width": 1.4, "hooks_per_panel": 9, "fabric": 4.74}, {"width": 1.65, "hooks_per_panel": 10, "fabric": 5.315}, {"width": 1.85, "hooks_per_panel": 11, "fabric": 5.775}, {"width": 2.05, "hooks_per_panel": 12, "fabric": 6.235}, {"width": 2.25, "hooks_per_panel": 13, "fabric": 6.695}, {"width": 2.45, "hooks_per_panel": 14, "fabric": 7.155}, {"width": 2.65, "hooks_per_panel": 15, "fabric": 7.615}, {"width": 2.85, "hooks_per_panel": 16, "fabric": 8.075}, {"width": 3.05, "hooks_per_panel": 17, "fabric": 8.535}, {"width": 3.25, "hooks_per_panel": 18, "fabric": 8.995}, {"width": 3.45, "hooks_per_panel": 19, "fabric": 9.455}, {"width": 3.66, "hooks_per_panel": 20, "fabric": 9.938}, {"width": 3.87, "hooks_per_panel": 21, "fabric": 10.421}, {"width": 4.08, "hooks_per_panel": 22, "fabric": 10.904}, {"width": 4.29, "hooks_per_panel": 23, "fabric": 11.387}, {"width": 4.47, "hooks_per_panel": 24, "fabric": 11.801}, {"width": 4.68, "hooks_per_panel": 25, "fabric": 12.284}, {"width": 4.88, "hooks_per_panel": 26, "fabric": 12.744}, {"width": 5.1, "hooks_per_panel": 27, "fabric": 13.25}, {"width": 5.3, "hooks_per_panel": 28, "fabric": 13.71}, {"width": 5.5, "hooks_per_panel": 29, "fabric": 14.17}, {"width": 5.7, "hooks_per_panel": 30, "fabric": 14.63}, {"width": 5.9, "hooks_per_panel": 31, "fabric": 15.09}, {"width": 6.1, "hooks_per_panel": 32, "fabric": 15.55}, {"width": 6.3, "hooks_per_panel": 33, "fabric": 16.01}, {"width": 6.5, "hooks_per_panel": 34, "fabric": 16.47}, {"width": 6.71, "hooks_per_panel": 35, "fabric": 16.953}, {"width": 6.91, "hooks_per_panel": 36, "fabric": 17.413}, {"width": 7.11, "hooks_per_panel": 37, "fabric": 17.873}, {"width": 7.32, "hooks_per_panel": 38, "fabric": 18.356}, {"width": 7.52, "hooks_per_panel": 39, "fabric": 18.816}, {"width": 7.73, "hooks_per_panel": 40, "fabric": 19.299}, {"width": 7.94, "hooks_per_panel": 41, "fabric": 19.782}, {"width": 8.14, "hooks_per_panel": 42, "fabric": 20.242}, {"width": 8.34, "hooks_per_panel": 43, "fabric": 20.702}, {"width": 8.54, "hooks_per_panel": 44, "fabric": 21.162}, {"width": 8.74, "hooks_per_panel": 45, "fabric": 21.622}, {"width": 8.94, "hooks_per_panel": 46, "fabric": 22.082}, {"width": 0.6, "hooks_per_panel": 7, "fabric": 0.29}, {"width": 1.0, "hooks_per_panel": 11, "fabric": 0.41}, {"width": 1.5, "hooks_per_panel": 16, "fabric": 0.56}, {"width": 2.0, "hooks_per_panel": 21, "fabric": 0.71}, {"width": 2.5, "hooks_per_panel": 26, "fabric": 0.86}, {"width": 3.0, "hooks_per_panel": 31, "fabric": 1.01}, {"width": 3.5, "hooks_per_panel": 36, "fabric": 1.16}, {"width": 3.8, "hooks_per_panel": 39, "fabric": 1.25}], "pinch_5_single": [{"width": 1.2, "hooks": 11, "fabric": 3.23}, {"width": 1.3, "hooks": 11, "fabric": 3.43}, {"width": 1.4, "hooks": 12, "fabric": 3.63}, {"width": 1.65, "hooks": 14, "fabric": 4.13}, {"width": 1.85, "hooks": 16, "fabric": 4.53}, {"width": 2.05, "hooks": 17, "fabric": 4.93}, {"width": 2.25, "hooks": 19, "fabric": 5.33}, {"width": 2.45, "hooks": 20, "fabric": 5.73}, {"width": 2.65, "hooks": 22, "fabric": 6.13}, {"width": 2.85, "hooks": 23, "fabric": 6.53}, {"width": 3.05, "hooks": 25, "fabric": 6.93}, {"width": 3.25, "hooks": 26, "fabric": 7.33}, {"width": 3.45, "hooks": 28, "fabric": 7.73}, {"width": 3.66, "hooks": 29, "fabric": 8.15}, {"width": 3.87, "hooks": 31, "fabric": 8.57}, {"width": 4.08, "hooks": 33, "fabric": 8.99}, {"width": 4.29, "hooks": 34, "fabric": 9.41}, {"width": 4.47, "hooks": 36, "fabric": 9.77}, {"width": 4.68, "hooks": 37, "fabric": 10.19}, {"width": 4.88, "hooks": 39, "fabric": 10.59}, {"width": 5.1, "hooks": 41, "fabric": 11.03}, {"width": 5.3, "hooks": 42, "fabric": 11.43}, {"width": 5.5, "hooks": 44, "fabric": 11.83}, {"width": 5.7, "hooks": 45, "fabric": 12.23}, {"width": 5.9, "hooks": 47, "fabric": 12.63}, {"width": 6.1, "hooks": 48, "fabric": 13.03}, {"width": 6.3, "hooks": 50, "fabric": 13.43}, {"width": 6.5, "hooks": 51, "fabric": 13.83}, {"width": 6.71, "hooks": 53, "fabric": 14.25}, {"width": 6.91, "hooks": 54, "fabric": 14.65}, {"width": 7.11, "hooks": 56, "fabric": 15.05}, {"width": 7.32, "hooks": 58, "fabric": 15.47}, {"width": 7.52, "hooks": 59, "fabric": 15.87}, {"width": 7.73, "hooks": 61, "fabric": 16.29}, {"width": 7.94, "hooks": 62, "fabric": 16.71}, {"width": 8.14, "hooks": 64, "fabric": 17.11}, {"width": 8.34, "hooks": 65, "fabric": 17.51}, {"width": 8.54, "hooks": 67, "fabric": 17.91}, {"width": 8.74, "hooks": 69, "fabric": 18.31}, {"width": 8.94, "hooks": 70, "fabric": 18.71}], "pinch_5_pair": [{"width": 1.2, "hooks_per_panel": 6, "fabric": 3.86}, {"width": 1.3, "hooks_per_panel": 6, "fabric": 4.06}, {"width": 1.4, "hooks_per_panel": 7, "fabric": 4.26}, {"width": 1.65, "hooks_per_panel": 8, "fabric": 4.76}, {"width": 1.85, "hooks_per_panel": 8, "fabric": 5.16}, {"width": 2.05, "hooks_per_panel": 9, "fabric": 5.56}, {"width": 2.25, "hooks_per_panel": 10, "fabric": 5.96}, {"width": 2.45, "hooks_per_panel": 11, "fabric": 6.36}, {"width": 2.65, "hooks_per_panel": 11, "fabric": 6.76}, {"width": 2.85, "hooks_per_panel": 12, "fabric": 7.16}, {"width": 3.05, "hooks_per_panel": 13, "fabric": 7.56}, {"width": 3.25, "hooks_per_panel": 14, "fabric": 7.96}, {"width": 3.45, "hooks_per_panel": 15, "fabric": 8.36}, {"width": 3.66, "hooks_per_panel": 15, "fabric": 8.78}, {"width": 3.87, "hooks_per_panel": 16, "fabric": 9.2}, {"width": 4.08, "hooks_per_panel": 17, "fabric": 9.62}, {"width": 4.29, "hooks_per_panel": 18, "fabric": 10.04}, {"width": 4.47, "hooks_per_panel": 18, "fabric": 10.4}, {"width": 4.68, "hooks_per_panel": 19, "fabric": 10.82}, {"width": 4.88, "hooks_per_panel": 20, "fabric": 11.22}, {"width": 5.1, "hooks_per_panel": 21, "fabric": 11.66}, {"width": 5.3, "hooks_per_panel": 22, "fabric": 12.06}, {"width": 5.5, "hooks_per_panel": 22, "fabric": 12.46}, {"width": 5.7, "hooks_per_panel": 23, "fabric": 12.86}, {"width": 5.9, "hooks_per_panel": 24, "fabric": 13.26}, {"width": 6.1, "hooks_per_panel": 25, "fabric": 13.66}, {"width": 6.3, "hooks_per_panel": 26, "fabric": 14.06}, {"width": 6.5, "hooks_per_panel": 26, "fabric": 14.46}, {"width": 6.71, "hooks_per_panel": 27, "fabric": 14.88}, {"width": 6.91, "hooks_per_panel": 28, "fabric": 15.28}, {"width": 7.11, "hooks_per_panel": 29, "fabric": 15.68}, {"width": 7.32, "hooks_per_panel": 29, "fabric": 16.1}, {"width": 7.52, "hooks_per_panel": 30, "fabric": 16.5}, {"width": 7.73, "hooks_per_panel": 31, "fabric": 16.92}, {"width": 7.94, "hooks_per_panel": 32, "fabric": 17.34}, {"width": 8.14, "hooks_per_panel": 33, "fabric": 17.74}, {"width": 8.34, "hooks_per_panel": 33, "fabric": 18.14}, {"width": 8.54, "hooks_per_panel": 34, "fabric": 18.54}, {"width": 8.74, "hooks_per_panel": 35, "fabric": 18.94}, {"width": 8.94, "hooks_per_panel": 36, "fabric": 19.34}], "ripple_8_single": [{"width": 1.2, "runners": 18, "fabric": 2.4}, {"width": 1.3, "runners": 18, "fabric": 2.4}, {"width": 1.4, "runners": 20, "fabric": 2.62}, {"width": 1.65, "runners": 24, "fabric": 3.06}, {"width": 1.85, "runners": 26, "fabric": 3.28}, {"width": 2.05, "runners": 28, "fabric": 3.5}, {"width": 2.25, "runners": 30, "fabric": 3.72}, {"width": 2.45, "runners": 32, "fabric": 3.94}, {"width": 2.65, "runners": 36, "fabric": 4.38}, {"width": 2.85, "runners": 38, "fabric": 4.6}, {"width": 3.05, "runners": 40, "fabric": 4.82}, {"width": 3.25, "runners": 42, "fabric": 5.04}, {"width": 3.45, "runners": 46, "fabric": 5.48}, {"width": 3.66, "runners": 48, "fabric": 5.7}, {"width": 3.87, "runners": 50, "fabric": 5.92}, {"width": 4.08, "runners": 54, "fabric": 6.36}, {"width": 4.29, "runners": 56, "fabric": 6.58}, {"width": 4.47, "runners": 58, "fabric": 6.8}, {"width": 4.68, "runners": 60, "fabric": 7.02}, {"width": 4.88, "runners": 64, "fabric": 7.46}, {"width": 5.1, "runners": 66, "fabric": 7.68}, {"width": 5.3, "runners": 68, "fabric": 7.9}, {"width": 5.5, "runners": 70, "fabric": 8.12}, {"width": 5.7, "runners": 74, "fabric": 8.56}, {"width": 5.9, "runners": 76, "fabric": 8.78}, {"width": 6.1, "runners": 78, "fabric": 9.0}, {"width": 6.3, "runners": 80, "fabric": 9.22}, {"width": 6.5, "runners": 84, "fabric": 9.66}, {"width": 6.71, "runners": 86, "fabric": 9.88}, {"width": 6.91, "runners": 88, "fabric": 10.1}, {"width": 7.11, "runners": 90, "fabric": 10.32}, {"width": 7.32, "runners": 94, "fabric": 10.76}, {"width": 7.52, "runners": 96, "fabric": 10.98}, {"width": 7.73, "runners": 98, "fabric": 11.2}, {"width": 7.94, "runners": 102, "fabric": 11.64}, {"width": 8.14, "runners": 104, "fabric": 11.86}, {"width": 8.34, "runners": 106, "fabric": 12.08}, {"width": 8.54, "runners": 108, "fabric": 12.3}, {"width": 8.74, "runners": 112, "fabric": 12.74}, {"width": 8.94, "runners": 114, "fabric": 12.96}], "ripple_8_pair": [{"width": 1.2, "runners_per_panel": 20, "fabric": 3.04}, {"width": 1.3, "runners_per_panel": 20, "fabric": 3.04}, {"width": 1.4, "runners_per_panel": 20, "fabric": 3.04}, {"width": 1.65, "runners_per_panel": 24, "fabric": 3.48}, {"width": 1.85, "runners_per_panel": 28, "fabric": 3.92}, {"width": 2.05, "runners_per_panel": 28, "fabric": 3.92}, {"width": 2.25, "runners_per_panel": 32, "fabric": 4.36}, {"width": 2.45, "runners_per_panel": 36, "fabric": 4.8}, {"width": 2.65, "runners_per_panel": 36, "fabric": 4.8}, {"width": 2.85, "runners_per_panel": 40, "fabric": 5.24}, {"width": 3.05, "runners_per_panel": 40, "fabric": 5.24}, {"width": 3.25, "runners_per_panel": 44, "fabric": 5.68}, {"width": 3.45, "runners_per_panel": 44, "fabric": 5.68}, {"width": 3.66, "runners_per_panel": 48, "fabric": 6.12}, {"width": 3.87, "runners_per_panel": 52, "fabric": 6.56}, {"width": 4.08, "runners_per_panel": 52, "fabric": 6.56}, {"width": 4.29, "runners_per_panel": 56, "fabric": 7.0}, {"width": 4.47, "runners_per_panel": 60, "fabric": 7.44}, {"width": 4.68, "runners_per_panel": 60, "fabric": 7.44}, {"width": 4.88, "runners_per_panel": 64, "fabric": 7.88}, {"width": 5.1, "runners_per_panel": 68, "fabric": 8.32}, {"width": 5.3, "runners_per_panel": 68, "fabric": 8.32}, {"width": 5.5, "runners_per_panel": 72, "fabric": 8.76}, {"width": 5.7, "runners_per_panel": 76, "fabric": 9.2}, {"width": 5.9, "runners_per_panel": 76, "fabric": 9.2}, {"width": 6.1, "runners_per_panel": 80, "fabric": 9.64}, {"width": 6.3, "runners_per_panel": 80, "fabric": 9.64}, {"width": 6.5, "runners_per_panel": 84, "fabric": 10.08}, {"width": 6.71, "runners_per_panel": 88, "fabric": 10.52}, {"width": 6.91, "runners_per_panel": 88, "fabric": 10.52}, {"width": 7.11, "runners_per_panel": 92, "fabric": 10.96}, {"width": 7.32, "runners_per_panel": 96, "fabric": 11.4}, {"width": 7.52, "runners_per_panel": 96, "fabric": 11.4}, {"width": 7.73, "runners_per_panel": 100, "fabric": 11.84}, {"width": 7.94, "runners_per_panel": 104, "fabric": 12.28}, {"width": 8.14, "runners_per_panel": 104, "fabric": 12.28}, {"width": 8.34, "runners_per_panel": 108, "fabric": 12.72}, {"width": 8.54, "runners_per_panel": 108, "fabric": 12.72}, {"width": 8.74, "runners_per_panel": 112, "fabric": 13.16}, {"width": 8.94, "runners_per_panel": 116, "fabric": 13.6}]};

// Base Rate lookup constants from June 15 price sheet
const JIN_ROMAN_BASE_PRICES = {
    'cordless': {
        'plain':   { 'A': 7.50, 'B': 7.50, 'C': 8.00, 'D': 8.00 },
        'ribbed':  { 'A': 7.50, 'B': 7.50, 'C': 8.00, 'D': 8.00 },
        'flat':    { 'A': 7.50, 'B': 7.50, 'C': 8.00, 'D': 8.00 },
        'hobbled': { 'A': 8.50, 'B': 8.50, 'C': 9.00, 'D': 9.00 },
        'relaxed': { 'A': 8.50, 'B': 8.50, 'C': 9.00, 'D': 9.00 },
        'tulip':   { 'A': 8.50, 'B': 8.50, 'C': 9.00, 'D': 9.00 },
        'tdbu':    { 'A': 8.50, 'B': 8.50, 'C': 9.00, 'D': 9.00 },
        'twin':    { 'A': 13.00, 'B': 13.00, 'C': 14.00, 'D': 14.00 },
        'balloon': { 'A': 8.50, 'B': 8.50, 'C': 8.50, 'D': 8.50 }
    },
    'ccl': {
        'plain':   { 'A': 6.80, 'B': 6.80, 'C': 7.30, 'D': 7.30 },
        'ribbed':  { 'A': 6.80, 'B': 6.80, 'C': 7.30, 'D': 7.30 },
        'flat':    { 'A': 6.80, 'B': 6.80, 'C': 7.30, 'D': 7.30 },
        'hobbled': { 'A': 7.80, 'B': 7.80, 'C': 8.30, 'D': 8.30 },
        'relaxed': { 'A': 7.80, 'B': 7.80, 'C': 8.30, 'D': 8.30 },
        'tulip':   { 'A': 7.80, 'B': 7.80, 'C': 8.30, 'D': 8.30 },
        'twin':    { 'A': 13.00, 'B': 13.00, 'C': 14.00, 'D': 14.00 },
        'tdbu':    { 'A': 8.50, 'B': 8.50, 'C': 9.00, 'D': 9.00 },
        'balloon': { 'A': 8.50, 'B': 8.50, 'C': 8.50, 'D': 8.50 }
    }
};

const JIN_DRAPERY_BASE_PRICES = {
    'regular': {
        'standard': { 'A': 1.35, 'B': 1.65, 'C': 2.15, 'D': 2.50 },
        'premium':  { 'A': 1.60, 'B': 1.95, 'C': 2.58, 'D': 3.00 }
    },
    'sheer': {
        'standard': { 'A': 0.58, 'B': 0.90, 'C': 0.90, 'D': 0.90 },
        'premium':  { 'A': 0.70, 'B': 1.08, 'C': 1.08, 'D': 1.08 }
    }
};

function isDraperySheer(fabricCode) {
    if (!fabricCode) return false;
    const clean = fabricCode.toUpperCase().trim();
    return clean.startsWith('SB') || clean.startsWith('SH') || clean.startsWith('DTS') || clean.startsWith('DS') || clean.includes('SHEER');
}

function getIsSheer(item) {
    if (item.is_sheer_force_regular) return false;
    if (item.is_sheer_force_sheer) return true;
    return isDraperySheer(item.fabric_code);
}

function findMaterialInDb(fabricCode, patternName = '') {
    if (!fabricCode && !patternName) return null;

    let codeUpper = fabricCode ? fabricCode.toString().toUpperCase().trim() : '';
    let nameUpper = patternName ? patternName.toString().toUpperCase().trim() : '';

    // 0. Look up in FACTORY_MAPPING first
    const mapping = {"DTC422-21M": "UE-01C", "DTC417-3M": "UE-02C", "DTC439-3M": "UE-03C", "DTC419-8M": "UE-04C", "DTW0220-12M": "UE-05C", "DTC439-4M": "UE-06C", "DTC439-5M": "UE-07C", "DTW141-2M": "UE-08C", "DTW141-5M": "UE-09C", "DTW141-7M": "UE-10C", "DTW141-4M": "UE-11C", "DTW141-6M": "UE-12C", "DTW3244-16M": "UE-13C", "DTG183-2K": "GC-01B", "DTG164-2K": "GC-02B", "DTG276-2K": "GC-03B", "DTG212-6K": "GC-04B", "DTG277-5K": "GC-05B", "DTG367-5K": "GC-06B", "DTG224-5K": "GC-07B", "DTG212-4K": "GC-08B", "DTG164-5K": "GC-09B", "DTG200-21K": "GC-10B", "DTG274-4K": "GC-11B", "DTG291-5K": "GC-12B", "DTG212-26K": "GC-13B", "DTW0281-13K": "ML-01B", "DTW0281-33K": "ML-02B", "DTW0281-32K": "ML-03B", "DTW0281-29K": "ML-04B", "DTW0281-23K": "ML-05B", "DTW0281-24K": "ML-06B", "DTW0281-35K": "ML-07B", "DTW0281-26K": "ML-08B", "DTW0281-22K": "ML-09B", "DTG328-2M": "CC-01C", "DTG326-21M": "CC-02C", "DTG331-2M": "CC-03C", "DTG331-3M": "CC-04C", "DTC423-7M": "CC-05C", "DTG327-10M": "CC-06C", "DTG638-3M": "CC-07C", "DTG638-2M": "CC-08C", "DTG387-7M": "CC-09C", "DTG388-6M": "CC-10C", "DTG387-8M": "CC-11C", "DTG387-9M": "CC-12C", "DTG387-4M": "CC-13C", "DTG201-23M": "CC-14C", "DTG638-5M": "CC-15C", "DTG331-5M": "CC-16C", "DTG331-9M": "CC-17C", "DTG298-21M": "CC-18C", "DTC423-21M": "CC-19C", "DTG331-8M": "CC-20C", "DTW0283-14K": "AA-01B", "DTW0283-17K": "AA-02B", "DTW0283-18K": "AA-03B", "DTW0283-16K": "AA-04B", "DTW0283-24K": "AA-05B", "DTW0282-14K": "OM-01B", "DTW0282-22K": "OM-02B", "DTW0282-23K": "OM-03B", "DTW0282-24K": "OM-04B", "DTW0282-10K": "OM-05B", "DTW0282-19K": "OM-06B", "DTW4427-5K": "OM-07B", "DTC237-3M": "OM-08B", "DTW926-340K": "OM-09B", "DTW3613-5K": "OM-10B", "DTC237-5M": "OM-11B", "DTW028-712M": "CR-01C", "DTW028-715M": "CR-02C", "DTW028-714M": "CR-03C", "DTW028-320K": "TT-01B", "DTW028-317K": "TT-02B", "DTW028-316K": "TT-03B", "DTW028-610N": "OO-01D", "DTW028-616N": "OO-02D", "DTW028-612N": "OO-03D", "DTW0270-12N": "LL-01D", "DTW0270-14N": "LL-02D", "DTW0270-13N": "LL-03D", "DTW0270-17N": "/", "DTB2149-8H": "UO-02A", "DTB2149-10H": "UO-03A", "DTB2149-31H": "UO-05A", "DTB270-23H": "UO-06A", "DTB270-26H": "UO-07A", "DTB270-28H": "UO-08A", "DTB270-6H": "UO-09A", "DTB270-33H": "UO-10A", "DTB270-34H": "UO-11A", "DTB270-38H": "UO-12A", "DTB270-39H": "UO-13A", "DTB270-43H": "UO-14A", "DTB270-37H": "UO-15A", "DTB9027-6K": "PP-01B", "DTB9934-2K": "PP-02B", "DTB9934-3K": "PP-03B", "DTB026-2K": "PP-04B", "DTB9934-5K": "PP-05B", "DTB9027-7K": "PP-06B", "DTB0631-2K": "PP-07B", "DTB0631-5K": "PP-08B", "DTG384-7K": "PP-09B", "DTB026-21K": "PP-10B", "DTB026-6K": "PP-11B", "DTB026-8K": "PP-12B", "DTW926-713K": "PP-13B", "DTW926-722K": "PP-14B", "DTW926-726K": "PP-15B", "DTW926-721K": "PP-16B", "DTW926-734K": "PP-17B", "DTW926-730K": "PP-18B", "DTG306-2K": "HC-01B", "DTG369-4K": "HC-02B", "DTG365-2K": "HC-03B", "DTG204-6K": "HC-04B", "DTG306-4K": "HC-05B", "DTG369-6K": "HC-06B", "DTG369-5K": "HC-07B", "DTG369-2K": "HC-08B", "DTG375-3K": "HC-09B", "DTG365-5K": "HC-10B", "DTG306-3K": "HC-11B", "DTG375-4K": "HC-12B", "DTG365-4K": "HC-13B", "DTG365-3K": "HC-14B", "DTG306-6K": "HC-15B", "DTG373-4K": "HC-16B", "DTG303-8K": "HC-17B", "DTG230-21K": "HC-18B", "DTG375-2K": "CT-01B", "DTB012-2K": "CT-02B", "DTB012-3K": "CT-03B", "DTG365-7K": "CT-04B", "DTG386-4K": "CT-05B", "DTG370-2K": "CT-06B", "DTG382-6K": "CT-07B", "DTG389-5K": "CT-08B", "DTG268-7K": "CT-09B", "DTG373-2K": "CT-10B", "DTG382-2K": "CT-11B", "DTG386-2K": "CT-12B", "DTG392-2K": "CT-13B", "DTG302-4K": "CT-14B", "DTG386-8K": "CT-15B", "DTG370-3K": "CT-16B", "DTG370-6K": "CT-17B", "DTG382-4K": "CT-18B", "DTG370-7K": "CT-19B", "DTG370-4K": "CT-20B", "DTE18-2M": "UC-01B", "DTE16-2K": "UC-08B", "DTE12-2K": "UC-09B", "DTG371-3K": "UC-10B", "DTG304-4K": "UC-11B", "DTS534-50K": "SH-01B", "DTS534-35K": "SH-02B", "DTS312-89K": "SH-03B", "DTS191-18K": "SH-04B", "DTS312-59K": "SH-05B", "DTS534-61K": "SH-06B", "DTS534-53K": "SH-07B", "DTS534-62K": "SH-08B", "DTS312-71K": "SH-09B", "DTS312-8K": "SH-10B", "DTS312-55K": "SH-11B", "DTS312-75K": "SH-12B", "DTS312-52K": "SH-13B", "DTS312-58K": "SH-14B", "DTS312-05K": "SH-15B", "DTS534-57K": "SH-16B", "DTS312-06K": "SH-17B", "DTS177-15H": "SB-01A", "DTS179-25H": "SB-02A", "DTS534-54H": "SB-03A", "DTS534-10H": "SB-04A", "DTS534-48H": "SB-05A", "DTS534-37H": "SB-06A", "DTS534-63H": "SB-07A", "DTS179-38H": "SB-08A", "DTS191-38H": "SB-09A", "DTS291-22H": "SB-10A", "DTS534-52H": "SB-11A"};
    if (codeUpper && mapping[codeUpper]) {
        codeUpper = mapping[codeUpper];
    } else if (codeUpper) {
        // Substring match in mapping keys
        for (let key in mapping) {
            if (codeUpper.includes(key)) {
                codeUpper = mapping[key];
                break;
            }
        }
    }
    if (nameUpper && mapping[nameUpper]) {
        nameUpper = mapping[nameUpper];
    } else if (nameUpper) {
        // Substring match in mapping keys
        for (let key in mapping) {
            if (nameUpper.includes(key)) {
                nameUpper = mapping[key];
                break;
            }
        }
    }

    // 1. Exact match on pattern_code or code
    let found = MATERIALS_DB.find(m => {
        const mPat = m.pattern_code ? m.pattern_code.toString().toUpperCase().trim() : '';
        const mCode = m.code ? m.code.toString().toUpperCase().trim() : '';
        return (codeUpper && ((mPat !== '' && mPat === codeUpper) || (mCode !== '' && mCode === codeUpper))) ||
               (nameUpper && ((mPat !== '' && mPat === nameUpper) || (mCode !== '' && mCode === nameUpper)));
    });
    if (found) return found;

    // 2. Token-based exact match (avoiding partial substring matches like SH3-1 matching SH3-11)
    const tokensCode = codeUpper ? codeUpper.split(/[\s,;	\/]+/).map(t => t.trim()).filter(t => t !== '') : [];
    const tokensName = nameUpper ? nameUpper.split(/[\s,;	\/]+/).map(t => t.trim()).filter(t => t !== '') : [];
    found = MATERIALS_DB.find(m => {
        const mPat = m.pattern_code ? m.pattern_code.toString().toUpperCase().trim() : '';
        const mCode = m.code ? m.code.toString().toUpperCase().trim() : '';
        return (codeUpper && ((mPat !== '' && tokensCode.includes(mPat)) || (mCode !== '' && tokensCode.includes(mCode)))) ||
               (nameUpper && ((mPat !== '' && tokensName.includes(mPat)) || (mCode !== '' && tokensName.includes(mCode))));
    });
    return found;
}

function extractFabricGroup(code, patternName = '') {
    const cleanCode = code ? code.toString().replace(/\(.*?\)/g, '').trim().toUpperCase() : '';
    const lastCodeChar = cleanCode.slice(-1);
    if (['H', 'K', 'M', 'N', 'A', 'B', 'C', 'D'].includes(lastCodeChar)) {
        return lastCodeChar;
    }

    const cleanPattern = patternName ? patternName.toString().replace(/\(.*?\)/g, '').trim().toUpperCase() : '';
    const lastPatternChar = cleanPattern.slice(-1);
    if (['H', 'K', 'M', 'N', 'A', 'B', 'C', 'D'].includes(lastPatternChar)) {
        return lastPatternChar;
    }

    const codeGroupMatch = cleanCode.match(/GROUP\s*([HKMNABCD])/i);
    if (codeGroupMatch) {
        return codeGroupMatch[1].toUpperCase();
    }

    const patternGroupMatch = cleanPattern.match(/GROUP\s*([HKMNABCD])/i);
    if (patternGroupMatch) {
        return patternGroupMatch[1].toUpperCase();
    }

    return null;
}

function getRomanBaseRate(style, lift, group) {
    let styleKey = (style || 'plain').toLowerCase().trim();
    let liftKey = (lift || 'cordless').toLowerCase().trim();

    let baseType = 'cordless';
    if (liftKey === 'ccl') {
        baseType = 'ccl';
    }

    if (!['plain', 'ribbed', 'flat', 'hobbled', 'relaxed', 'tulip', 'tdbu', 'twin', 'balloon'].includes(styleKey)) {
        styleKey = 'plain';
    }

    let grp = group ? group.toString().trim().toUpperCase() : 'B';
    if (!['A', 'B', 'C', 'D'].includes(grp)) {
        if (grp === 'H') grp = 'A';
        else if (grp === 'K') grp = 'B';
        else if (grp === 'M') grp = 'C';
        else if (grp === 'N') grp = 'D';
        else grp = 'B';
    }

    const rate = JIN_ROMAN_BASE_PRICES[baseType][styleKey][grp];
    return rate || 0;
}

function getDraperyBaseRate(style, group, fabricCode, isSheer) {
    const styleKey = style || 'double_pinch';
    const isPremium = ['ripple_fold', 'triple_pinch', 'triple_french', 'triple_tailor', 'inverted'].includes(styleKey);
    const category = isPremium ? 'premium' : 'standard';

    if (isSheer === undefined) {
        isSheer = isDraperySheer(fabricCode);
    }
    const fabricType = isSheer ? 'sheer' : 'regular';

    let grp = group ? group.toString().trim().toUpperCase() : 'B';
    if (!['A', 'B', 'C', 'D'].includes(grp)) {
        if (grp === 'H') grp = 'A';
        else if (grp === 'K') grp = 'B';
        else if (grp === 'M') grp = 'C';
        else if (grp === 'N') grp = 'D';
        else grp = 'B';
    }

    const rate = JIN_DRAPERY_BASE_PRICES[fabricType][category][grp];
    return rate || 0;
}

// Global temp variable for uploaded/captured photo DataURL
let tempPhotoDataUrl = '';

// Helper to open a modal window displaying room image in full screen
window.showImageModal = function(src) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';
    overlay.style.cursor = 'zoom-out';

    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 8px 30px rgba(0,0,0,0.6)';
    img.style.transition = 'transform 0.3s ease';

    overlay.appendChild(img);
    overlay.onclick = function() {
        document.body.removeChild(overlay);
    };
    document.body.appendChild(overlay);
};

// 6.1 Fabrication Calculation Helpers

// Round height to nearest 1/8 inch
function roundToNearestEighth(val) {
    return Math.round(val * 8) / 8;
}

// Helper to determine the lookup sheet name for Roman Shade
function getRomanSheetName(style, lining, fabricCode, isSheer) {
    if (isSheer === undefined) {
        isSheer = fabricCode && (
            fabricCode.toUpperCase().startsWith('DTS') ||
            fabricCode.toUpperCase().startsWith('DS') ||
            fabricCode.toUpperCase().startsWith('SB') ||
            fabricCode.toUpperCase().startsWith('SH') ||
            fabricCode.toUpperCase().includes('SHEER')
        );
    }

    if (style === 'plain' || style === 'hobbled' || style === 'relaxed' || style === 'tulip' || style === 'ribbed' || style === 'balloon') {
        if (isSheer) return '柔纱款2.5cm';
        return '前凸后凸款3cm'; // Standard fabric
    } else if (style === 'tdbu') {
        if (isSheer) return '上下开合柔纱款2.5cm';
        return '上下开合3cm';
    } else if (style === 'twin') {
        return '鱼鳞折叠款3cm';
    } else if (style === 'flat') {
        return '平铺款无明线';
    }
    return '前凸后凸款3cm';
}

// Look up Roman shade fold count from database
function getRomanFolds(sheetName, heightIn) {
    let rounded = roundToNearestEighth(heightIn);
    if (rounded < 24) rounded = 24;
    if (rounded > 96) rounded = 96;

    let key = rounded.toString();
    let folds = ROMAN_FOLDS_DB[sheetName][key];

    if (folds === undefined) {
        // Fallback closest search
        const keys = Object.keys(ROMAN_FOLDS_DB[sheetName]).map(Number).sort((a,b)=>a-b);
        let closest = keys[0];
        let minDiff = Math.abs(rounded - closest);
        for (let k of keys) {
            let diff = Math.abs(rounded - k);
            if (diff < minDiff) {
                minDiff = diff;
                closest = k;
            }
        }
        folds = ROMAN_FOLDS_DB[sheetName][closest.toString()];
    }
    return folds || 4;
}

// Calculate vertical drawing marks for Roman Shade
function calculateRomanDrawingMarks(sheetName, heightIn, folds) {
    // D = CEILING(ROUNDDOWN(heightIn * 2.54, 1), 0.5)
    let temp = Math.floor(heightIn * 2.54 * 10) / 10;
    let D = Math.ceil(temp * 2) / 2;

    let AK1 = 3;
    let AL1 = 3;
    let AM1 = 12;
    let X1 = 2;

    if (sheetName.includes('2.5cm')) {
        AK1 = 2.5;
        AL1 = 2.5;
    }

    let H = 0;
    let marks = [];

    if (sheetName === '前凸后凸款3cm' || sheetName === '前凸后凸款2.5cm') {
        H = Math.ceil(((D - 14) / (folds - 1)) * 2) / 2;
        let y = 8;
        for (let k = 1; k < folds; k++) {
            marks.push(y);
            marks.push(y + AK1);
            y = y + AK1 + H;
        }
        let y_F = D + folds * AK1;
        marks.push(y_F);
        marks.push(y_F);
    }
    else if (sheetName === '上下开合3cm' || sheetName === '上下开合2.5cm') {
        H = Math.ceil(((D - 18) / (folds - 1)) * 2) / 2;
        let y = 8;
        for (let k = 1; k < folds; k++) {
            marks.push(y);
            marks.push(y + AK1);
            y = y + AK1 + H;
        }
        let y_F = D + folds * AK1 - 4;
        marks.push(y_F);
        marks.push(y_F);
    }
    else if (sheetName === '鱼鳞折叠款3cm' || sheetName === '鱼鳞折叠款2.5cm') {
        H = Math.ceil(((D - 14 - AL1 / 2) / (folds - 1) + AM1) * 2) / 2;
        let y = 8 + AM1 / 2;
        let y_prime = y + AL1;
        marks.push(y);
        marks.push(y_prime);
        for (let k = 2; k < folds; k++) {
            y = y_prime + H;
            y_prime = y + AL1;
            marks.push(y);
            marks.push(y_prime);
        }
        let y_F = y_prime + H;
        marks.push(y_F);
        marks.push(y_F);
    }
    else if (sheetName === '平铺款无明线') {
        H = Math.ceil(((D - 14) / (folds - 1)) * 2) / 2;
        let y = 8;
        for (let k = 1; k < folds; k++) {
            marks.push(y);
            y = y + H;
        }
        let y_F = D + X1;
        marks.push(y_F);
    }
    else if (sheetName === '柔纱款2.5cm') {
        H = Math.ceil(((D - 15.25) / (folds - 1)) * 2) / 2;
        let y = 8 + 12 / 2; // AL1 = 12
        let y_prime = y + AK1; // AK1 = 2.5
        marks.push(y);
        marks.push(y_prime);
        for (let k = 2; k < folds; k++) {
            y = y_prime + H + 12;
            y_prime = y + AK1;
            marks.push(y);
            marks.push(y_prime);
        }
        let y_F = y_prime + H + 12;
        marks.push(y_F);
        marks.push(y_F);
    }
    else if (sheetName === '上下开合柔纱款2.5cm') {
        H = Math.ceil(((D - 19.25) / (folds - 1)) * 2) / 2;
        let y = 8 + 12 / 2; // AL1 = 12
        let y_prime = y + AK1;
        marks.push(y);
        marks.push(y_prime);
        for (let k = 2; k < folds; k++) {
            y = y_prime + H + 12;
            y_prime = y + AK1;
            marks.push(y);
            marks.push(y_prime);
        }
        let y_F = y_prime + H + 12;
        marks.push(y_F);
        marks.push(y_F);
    }

    marks = marks.map(m => Math.round(m * 10) / 10);
    let cut_h = marks[marks.length - 1] + 20;

    return { marks, cut_h, D, H };
}

// Calculate vertical cording string count and edge offset
function calculateRomanCording(width_cm, shadeStyle) {
    let cords = 2;
    let edge = 8;

    if (shadeStyle === 'tdbu') {
        if (width_cm <= 80) {
            cords = 2; edge = 8;
        } else if (width_cm <= 130) {
            cords = 3; edge = 10;
        } else if (width_cm <= 180) {
            cords = 4; edge = 10;
        } else {
            cords = 5; edge = 10;
        }
    } else {
        if (width_cm <= 65) {
            cords = 2; edge = 8;
        } else if (width_cm <= 110) {
            cords = 3; edge = 10;
        } else if (width_cm <= 160) {
            cords = 4; edge = 10;
        } else {
            cords = 5; edge = 15;
        }
    }
    return { cords, edge };
}

// Look up drapery fabrication data
function lookupDraperyFabrication(width_m, headerStyle, panelType, pleatUpgrade) {
    let listKey = 'pinch_4_single';
    if (headerStyle === 'ripple_fold') {
        listKey = panelType === 'pair' ? 'ripple_8_pair' : 'ripple_8_single';
    } else if (pleatUpgrade === 'yes') {
        listKey = panelType === 'pair' ? 'pinch_5_pair' : 'pinch_5_single';
    } else {
        listKey = panelType === 'pair' ? 'pinch_4_pair' : 'pinch_4_single';
    }

    const list = DRAPERY_FABRIC_DB[listKey];
    if (!list || list.length === 0) return { hooks: 0, fabric: 0, loops: 0 };

    // Find closest width in the list
    let closest = list[0];
    let minDiff = Math.abs(width_m - closest.width);
    for (let item of list) {
        let diff = Math.abs(width_m - item.width);
        if (diff < minDiff) {
            minDiff = diff;
            closest = item;
        }
    }

    let hooks = closest.hooks || closest.hooks_per_panel || closest.runners || closest.runners_per_panel || 0;
    let loops = closest.loops || closest.loops_per_panel || 0;
    let fabric = closest.fabric || 0;

    return { hooks, fabric, loops, matchedWidth: closest.width };
}

// Calculate fabrication details for any item
function calculateFabricationDetails(item) {
    if (item.type === 'roman') {
        const isIB = (item.mount === 'IM');
        const w_in_finished = isIB ? (item.width - 0.25) : item.width;
        let w_cm = (w_in_finished * 2.54).round(1);
        let h_cm = (item.height * 2.54).round(1);
        const isSheer = getIsSheer(item);
        let sheetName = getRomanSheetName(item.shade_style, item.lining, item.fabric_code, isSheer);
        let folds = getRomanFolds(sheetName, item.height);
        let draw = calculateRomanDrawingMarks(sheetName, item.height, folds);
        let cording = calculateRomanCording(w_cm, item.shade_style);
        return {
            type: 'roman',
            w_cm: w_cm,
            h_cm: h_cm,
            cut_w: w_cm,
            cut_h: draw.cut_h,
            folds: folds,
            marks: draw.marks,
            marksStr: draw.marks.join(', '),
            cords: cording.cords,
            edge: cording.edge,
            cordStr: cording.cords + '根 / ' + cording.edge + 'cm',
            D: draw.D,
            H: draw.H
        };
    } else if (item.type === 'drapery') {
        let w_cm = (item.width * 2.54).round(1);
        let h_cm = (item.height * 2.54).round(1);
        let w_m = w_cm / 100.0;
        let drapInfo = lookupDraperyFabrication(w_m, item.header_style, item.panel_type, item.pleat_upgrade);
        let fullness = 2.52;
        if (item.header_style === 'ripple_fold') {
            fullness = 2.02;
        } else if (item.header_style.startsWith('triple_') || item.header_style === 'triple_pinch') {
            fullness = 3.02;
        }
        let cut_w = (w_cm * fullness).round(1);
        let cut_h = (h_cm + 30).round(1);
        return {
            type: 'drapery',
            w_cm: w_cm,
            h_cm: h_cm,
            cut_w: cut_w,
            cut_h: cut_h,
            fabric: drapInfo.fabric,
            hooks: drapInfo.hooks,
            loops: drapInfo.loops,
            fullness: fullness
        };
    } else {
        let w_cm = (item.width * 2.54).round(1);
        return {
            type: 'rod',
            w_cm: w_cm,
            cut_w: w_cm,
            cut_h: 0
        };
    }
}

function calculateRodShippingFee(city, state) {
    if (!state || String(state).trim().toUpperCase() !== 'CA') {
        return 0;
    }
    const cleanCity = String(city).trim().toLowerCase();
    let distance = 0;
    if (cleanCity.includes('chino hills')) distance = 18;
    else if (cleanCity.includes('cerritos')) distance = 39;
    else if (cleanCity.includes('long beach')) distance = 53;
    else if (cleanCity.includes('lake forest')) distance = 42;
    else if (cleanCity.includes('aliso viejo')) distance = 48;
    else if (cleanCity.includes('sherman oaks')) distance = 52;
    else if (cleanCity.includes('tarzana')) distance = 58;
    else {
        return 0;
    }

    if (distance < 10) return 0;
    if (distance <= 20) return 50;

    const extraMiles = distance - 20;
    const extraIntervals = Math.ceil(extraMiles / 10);
    const fee = 50 + extraIntervals * 10;
    return Math.min(fee, 100);
}

function parseDimension(val) {
    if (!val) return 0;
    let clean = val.toString().replace(/\(Exact\)/i, '').replace(/\(Including.*?\)/i, '').trim();

    let matchFraction = clean.match(/^(\d+)\s+(\d+)\/(\d+)$/) || clean.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (matchFraction) {
        return parseFloat(matchFraction[1]) + (parseFloat(matchFraction[2]) / parseFloat(matchFraction[3]));
    }

    let matchSimpleFraction = clean.match(/^(\d+)\/(\d+)$/);
    if (matchSimpleFraction) {
        return parseFloat(matchSimpleFraction[1]) / parseFloat(matchSimpleFraction[2]);
    }

    return parseFloat(clean) || 0;
}

function calculateItemPrice(item) {
    if (item.type === 'manual') {
        const finalRate = item.width;
        return {
            rate: finalRate,
            amount: finalRate * item.qty,
            isRod: false,
            isManual: true,
            desc: item.fabric_code || "手动价格调整"
        };
    }

    if (item.type === 'rod') {
        const rate = 0.70;
        const retailRate = rate * item.width;
        let finalRate = retailRate.round(2);

        item.fabrication = calculateFabricationDetails(item);

        return {
            rate: finalRate,
            amount: finalRate * item.qty,
            isRod: true,
            desc: "Traverse Rod System (" + t("滑轨系统, 长度: ", "Traverse Rod, Length: ") + item.width_raw + t(" 英寸)", " Inches)")
        };
    }

    const group = item.fabric_group || 'B';
    const w = item.width;
    const h = item.height;
    const qty = item.qty;

    if (item.type === 'roman') {
        const areaSqft = (w * h) / 144.0;
        const chargeArea = Math.max(areaSqft, 10.0); // Minimum 10 sqft

        const baseRateSqft = getRomanBaseRate(item.shade_style, item.lift_control, group);
        let attributes = [];
        attributes.push("Base Rate: $" + baseRateSqft.toFixed(2) + "/sqft");

        let liningMult = 1.00;
        if (item.lining === 'blackout') {
            liningMult = 1.10;
            attributes.push(t('Blackout Lining (全遮光衬 +10%)', 'Blackout Lining (+10%)'));
        } else if (item.lining === 'privacy') {
            attributes.push(t('Privacy Lining (半遮光隐私衬)', 'Privacy Lining'));
        } else {
            attributes.push(t('Unlined (无衬)', 'Unlined'));
        }

        let shadeFabricPrice = (baseRateSqft * chargeArea * liningMult).round(2);

        let additions = 0;
        const liftKey = (item.lift_control || 'cordless').toLowerCase().trim();
        if (liftKey.startsWith('motorized') || liftKey === 'motor') {
            const motorVal = 0.00;
            additions += motorVal;
            attributes.push(t('Motorized (自备电机 +$', 'Motorized (+$') + motorVal.toFixed(2) + ')');
        }

        if (item.accessories === 'remote') {
            additions += 0.00;
            attributes.push(t('Remote (自备遥控器 +$0.00)', 'Remote (+$0.00)'));
        } else if (item.accessories === 'charger') {
            additions += 0.00;
            attributes.push(t('Charger (自备充电器 +$0.00)', 'Charger (+$0.00)'));
        } else if (item.accessories === 'wifi') {
            additions += 0.00;
            attributes.push(t('WiFi Tuya Hub (自备智能网关 +$0.00)', 'WiFi Tuya Hub (+$0.00)'));
        }

        let valanceCost = 0;
        const styleNorm = item.shade_style.toLowerCase();
        if (item.valance === 'yes' && (styleNorm === 'plain' || styleNorm === 'flat' || styleNorm === 'ribbed')) {
            const yards = Math.max(w / 36.0, 1.0);
            valanceCost = (yards * 8.00).round(2);
            attributes.push(t("Valance (拉帷幕 +$8.00/码, ", "Valance (+$8.00/yd, ") + yards.toFixed(2) + t("码)", " yds)"));
        }

        let trimCost = 0;
        if (item.trim && item.trim !== 'none') {
            const yards = Math.max(w / 36.0, 1.0);
            const trimRate = (item.trim === 'special') ? 8.00 : 2.50;
            trimCost = (yards * trimRate).round(2);
            attributes.push(t("Trim (花边 +$", "Trim (+$") + trimRate.toFixed(2) + t("/码, ", "/yd, ") + yards.toFixed(2) + t("码)", " yds)"));
        }

        let finalRate = shadeFabricPrice + additions + valanceCost + trimCost;
        finalRate = finalRate.round(2);

        item.fabrication = calculateFabricationDetails(item);

        return {
            rate: finalRate,
            amount: finalRate * qty,
            isRod: false,
            area: chargeArea,
            isOversized: w > 60,
            desc: t("罗马帘, 款式: ", "Roman Shade, Style: ") + item.shade_style + t(", 升降: ", ", Lift: ") + item.lift_control + t(", 面积: ", ", Area: ") + chargeArea.toFixed(2) + " sqft. (" + attributes.join(', ') + ")"
        };

    } else if (item.type === 'drapery') {
        const isSheer = getIsSheer(item);
        const baseRateInch = getDraperyBaseRate(item.header_style, group, item.fabric_code, isSheer);
        let attributes = [];
        attributes.push("Base Rate: $" + baseRateInch.toFixed(2) + t("/吋", "/inch"));

        let heightPct = 0.00;
        if (h > 104 && h <= 132) {
            heightPct = 0.20;
            attributes.push('Height Surcharge 104-132" (+20%)');
        } else if (h > 132 && h <= 158) {
            heightPct = 0.50;
            attributes.push('Height Surcharge 132-158" (+50%)');
        } else if (h > 158 && h <= 198) {
            heightPct = 1.00;
            attributes.push('Height Surcharge 158-198" (+100%)');
        } else if (h > 198 && h <= 238) {
            heightPct = 1.50;
            attributes.push('Height Surcharge 198-238" (+150%)');
        }

        let pleatPct = 0.00;
        if (item.pleat_upgrade === 'yes') {
            pleatPct = 0.15;
            attributes.push('4" Pleat Upgrade (+15%)');
        }

        let baseRateWithSurcharges = baseRateInch * (1.0 + heightPct + pleatPct);

        let liningRateInch = 0.00;
        if (item.lining === 'privacy') {
            liningRateInch = 0.72;
            attributes.push(t('Privacy Lining (防晒衬 +$0.72/吋)', 'Privacy Lining (+$0.72/inch)'));
        } else if (item.lining === 'blackout') {
            liningRateInch = 0.85;
            attributes.push(t('Blackout Lining (遮光衬 +$0.85/吋)', 'Blackout Lining (+$0.85/inch)'));
        } else if (item.lining === 'interlining') {
            liningRateInch = 0.80;
            attributes.push(t('Interlining (夹棉衬 +$0.80/吋)', 'Interlining (+$0.80/inch)'));
        } else {
            attributes.push(t('No Liner (无衬)', 'No Liner'));
        }

        let ratePerInch = baseRateWithSurcharges + liningRateInch;
        ratePerInch = ratePerInch.round(2);

        const chargeWidth = Math.max(w, 20.0);
        let shadeFabricRetail = ratePerInch * chargeWidth;

        const panels = item.panel_type === 'pair' ? 2 : 1;

        let trimCost = 0;
        if (item.trim && item.trim !== 'none') {
            const yards = (h / 36.0) * panels;
            const trimRate = (item.trim === 'special') ? 8.00 : 2.50;
            trimCost = (yards * trimRate).round(2);
            attributes.push(t("Trim (花边 +$", "Trim (+$") + trimRate.toFixed(2) + t("/码, ", "/yd, ") + yards.toFixed(2) + t("码)", " yds)"));
        }

        let tiebandCost = 0;
        if (item.tieband === 'yes') {
            tiebandCost = 6.00;
            attributes.push(t('Tieband (挂耳带 +$6.00/对)', 'Tieband (+$6.00/pair)'));
        }

        let memoryCost = 0;
        if (item.memory_shaping === 'yes') {
            memoryCost = panels * 100.00;
            attributes.push(t('Memory Shaping (高温定型 +$', 'Memory Shaping (+$') + memoryCost.toFixed(2) + ')');
        }

        let finalRate = shadeFabricRetail + trimCost + tiebandCost + memoryCost;
        finalRate = finalRate.round(2);

        let unitExtraRodCost = (item.track === 'traverse_rod') ? (w * 0.70).round(2) : 0;
        item.fabrication = calculateFabricationDetails(item);

        return {
            rate: finalRate + unitExtraRodCost,
            amount: (finalRate + unitExtraRodCost) * qty,
            extraRodCost: unitExtraRodCost * qty,
            unitExtraRodCost: unitExtraRodCost,
            isRod: false,
            desc: t("窗帘, 挂法: ", "Drapery, Header: ") + item.header_style + t(", 分幅: ", ", Panel: ") + item.panel_type + t(", 计价宽: ", ", Width: ") + chargeWidth + t("吋. (", "inch. (") + attributes.join(', ') + ")"
        };
    }
}

// 7. Add Item and Table Rendering
function handleAddItemSubmit(e) {
    e.preventDefault();

    const type = document.getElementById('form-item-type').value;
    const room = document.getElementById('item-room').value.trim();
    const qty = parseInt(document.getElementById('item-qty').value) || 1;
    const widthRaw = document.getElementById('item-width').value.trim();
    const heightRaw = document.getElementById('item-height').value.trim();
    const instructions = document.getElementById('item-instructions').value.trim();

    if (type === 'manual') {
        if (!room || !widthRaw) {
            alert('请填写房间位置和金额！');
            return;
        }
        const w = parseFloat(widthRaw);
        if (isNaN(w)) {
            alert('请输入正确的金额数值！');
            return;
        }
        const fabricCode = document.getElementById('item-fabric').value.trim();
        let item = {
            number: currentOrderItems.length + 1,
            room: room,
            type: type,
            qty: qty,
            width: w,
            width_raw: widthRaw,
            height: 0,
            height_raw: '',
            fabric_code: fabricCode || '手动调整',
            fabric_group: 'B',
            special_instructions: instructions,
            mount: 'IM',
            image: tempPhotoDataUrl || ''
        };
        item.pricing = calculateItemPrice(item);
        currentOrderItems.push(item);
    } else {
        if (!room || !widthRaw) {
            alert('请填写房间位置和成品尺寸宽度！');
            return;
        }

        const w = parseDimension(widthRaw);
        const h = (type !== 'rod') ? parseDimension(heightRaw) : 0;

        if (w <= 0 || (type !== 'rod' && h <= 0)) {
            alert('请输入正确的尺寸数值！');
            return;
        }

        const fabricCode = document.getElementById('item-fabric').value.trim();
        let fabricGroup = 'H';
        const fabricInput = document.getElementById('item-fabric');
        const selectedGroup = fabricInput.getAttribute('data-selected-group');
        if (selectedGroup) {
            fabricGroup = selectedGroup;
        } else if (fabricCode) {
            const extracted = extractFabricGroup(fabricCode, '');
            if (extracted) {
                fabricGroup = extracted;
            } else {
                const matchedMat = findMaterialInDb(fabricCode, '');
                if (matchedMat) fabricGroup = matchedMat.group;
            }
        }

        let item = {
            number: currentOrderItems.length + 1,
            room: room,
            type: type,
            qty: qty,
            width: w,
            width_raw: widthRaw,
            height: h,
            height_raw: heightRaw,
            fabric_code: fabricCode,
            fabric_group: fabricGroup,
            special_instructions: instructions,
            mount: document.getElementById('item-mount').value,
            image: tempPhotoDataUrl || ''
        };

        if (type === 'roman') {
            item.shade_style = document.getElementById('roman-style').value;
            item.lift_control = document.getElementById('roman-lift').value;
            item.valance = document.getElementById('roman-valance').value;
            item.accessories = document.getElementById('roman-acc').value;
            item.lining = document.getElementById('roman-lining').value;
            item.trim = document.getElementById('item-trim').value;
        } else if (type === 'drapery') {
            item.header_style = document.getElementById('drapery-header').value;
            item.panel_type = document.getElementById('drapery-panel').value;
            item.lining = document.getElementById('drapery-lining').value;
            item.track = document.getElementById('drapery-track').value;
            item.trim = document.getElementById('item-trim').value;
            item.pleat_upgrade = document.getElementById('drapery-pleat-upgrade').value;
            item.tieband = document.getElementById('drapery-tieband').value;
            item.memory_shaping = document.getElementById('drapery-memory').value;
        }

        item.pricing = calculateItemPrice(item);
        currentOrderItems.push(item);
    }

    document.getElementById('item-room').value = '';
    document.getElementById('item-width').value = '';
    document.getElementById('item-height').value = '';
    document.getElementById('item-instructions').value = '';
    document.getElementById('item-fabric').removeAttribute('data-selected-group');
    if (document.getElementById('drapery-memory')) {
        document.getElementById('drapery-memory').value = 'no';
    }

    // Reset photo upload fields
    tempPhotoDataUrl = '';
    const itemPhotoInput = document.getElementById('item-photo');
    if (itemPhotoInput) itemPhotoInput.value = '';
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    if (photoPreviewContainer) photoPreviewContainer.style.display = 'none';
    const photoPreview = document.getElementById('photo-preview');
    if (photoPreview) photoPreview.src = '';

    renderItemsTable();
}

function recalculateAllItems() {
    currentOrderItems.forEach(item => {
        item.pricing = calculateItemPrice(item);
    });
    renderItemsTable();
}

function renderItemsTable() {
    const tbody = document.getElementById('items-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (currentOrderItems.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="10">${t('订单中尚无产品，请使用上方表单添加或拖入订单 Excel 进行计算', 'No items in order. Please use form above or drag in Excel to calculate.')}</td>
            </tr>
        `;
        updateTotalsDisplay();
        return;
    }

    currentOrderItems.forEach((item, idx) => {
        item.number = idx + 1;
        const tr = document.createElement('tr');

        let typeLabel = '';
        if (item.type === 'roman') typeLabel = t('罗马帘', 'Roman');
        else if (item.type === 'drapery') typeLabel = t('窗帘', 'Drapery');
        else if (item.type === 'rod') typeLabel = t('轨道', 'Hardware');
        else if (item.type === 'manual') typeLabel = t('手动调整', 'Adjustment');

        let sizeLabel = '';
        if (item.type === 'manual') {
            sizeLabel = '-';
        } else if (item.type === 'rod') {
            sizeLabel = item.width_raw + '"';
        } else {
            sizeLabel = item.width_raw + '" × ' + item.height_raw + '"';
        }

        let fabricLabel = '';
        if (item.type === 'manual') {
            fabricLabel = '-';
        } else {
            fabricLabel = item.fabric_code ? item.fabric_code + " (" + t("组 ", "Group ") + item.fabric_group + ")" : t('无', 'None');
        }

        let imgHtml = '';
        if (item.image) {
            imgHtml = `<br><img src="${item.image}" alt="photo" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 1px solid var(--color-border); margin-top: 4px; transition: transform 0.2s;" class="room-thumbnail" onclick="showImageModal('${item.image}')">`;
        }

        const safeDesc = (item.pricing.desc || '').replace(/"/g, '&quot;');

        tr.innerHTML = `
            <td>${item.number}</td>
            <td><strong>${item.room}</strong>${imgHtml}</td>
            <td><span class="badge badge-type-${item.type}">${typeLabel}</span></td>
            <td>${sizeLabel}</td>
            <td>${fabricLabel}</td>
            <td>
                <textarea class="row-desc-input" data-index="${idx}" rows="3" style="width: 100%; min-width: 220px; min-height: 65px; box-sizing: border-box; resize: vertical; border: 1px solid #ddd; border-radius: 4px; padding: 6px; font-family: inherit; font-size: 13px; line-height: 1.4;">${safeDesc}</textarea><br>
                <small style="color:#888; white-space: pre-wrap; display: block; margin-top: 4px;">${item.special_instructions}</small>
            </td>
            <td>
                <input type="number" class="row-qty-input" data-index="${idx}" value="${item.qty}" min="1" style="width: 60px; text-align: center;">
            </td>
            <td>
                <input type="number" class="row-rate-input" data-index="${idx}" value="${item.pricing.rate.toFixed(2)}" step="0.01" style="width: 80px; text-align: center;">
            </td>
            <td><strong>$${item.pricing.amount.toFixed(2)}</strong></td>
            <td class="cell-actions">
                <button class="btn-action-del" onclick="deleteOrderItem(${idx})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Bind inline edit event listeners
    tbody.querySelectorAll('.row-qty-input').forEach(input => {
        input.addEventListener('change', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            let newQty = parseInt(this.value);
            if (isNaN(newQty) || newQty < 1) newQty = 1;
            this.value = newQty;

            const item = currentOrderItems[idx];
            const oldQty = item.qty;
            item.qty = newQty;

            if (item.pricing.unitExtraRodCost !== undefined) {
                item.pricing.extraRodCost = item.pricing.unitExtraRodCost * newQty;
            } else if (item.pricing.extraRodCost) {
                item.pricing.extraRodCost = (item.pricing.extraRodCost / oldQty) * newQty;
            }

            item.pricing.amount = item.pricing.rate * newQty;

            // Render row amount visually
            const rowAmountEl = tbody.querySelector(`tr:nth-child(${idx + 1}) td:nth-child(9) strong`);
            if (rowAmountEl) {
                rowAmountEl.textContent = `$${item.pricing.amount.toFixed(2)}`;
            }

            updateTotalsDisplay();
        });
    });

    tbody.querySelectorAll('.row-rate-input').forEach(input => {
        input.addEventListener('change', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            let newRate = parseFloat(this.value);
            if (isNaN(newRate)) newRate = 0;
            this.value = newRate.toFixed(2);

            const item = currentOrderItems[idx];
            item.pricing.rate = newRate;
            item.pricing.amount = newRate * item.qty;

            // Render row amount visually
            const rowAmountEl = tbody.querySelector(`tr:nth-child(${idx + 1}) td:nth-child(9) strong`);
            if (rowAmountEl) {
                rowAmountEl.textContent = `$${item.pricing.amount.toFixed(2)}`;
            }

            updateTotalsDisplay();
        });
    });

    tbody.querySelectorAll('.row-desc-input').forEach(input => {
        input.addEventListener('change', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            currentOrderItems[idx].pricing.desc = this.value;
        });
    });

    updateTotalsDisplay();
}

window.deleteOrderItem = function(idx) {
    currentOrderItems.splice(idx, 1);
    renderItemsTable();
};

function updateTotalsDisplay() {
    let subtotal = 0;
    let rodCost = 0;
    let oversizedCount = 0;

    currentOrderItems.forEach(item => {
        if (item.type === 'rod') {
            rodCost += item.pricing.amount;
        } else {
            subtotal += item.pricing.amount;
            if (item.type === 'roman' && item.pricing.isOversized) {
                oversizedCount += item.qty;
            }
            if (item.pricing.extraRodCost) {
                rodCost += item.pricing.extraRodCost;
                subtotal -= item.pricing.extraRodCost;
            }
        }
    });

    let oversizedCost = 0;
    if (oversizedCount > 0) {
        oversizedCost = 50 + (oversizedCount - 1) * 25;
    }

    const shippingVal = parseFloat(document.getElementById('meta-shipping').value) || 0;

    // Custom Addition/Deduction
    const additionVal = parseFloat(document.getElementById('meta-addition-amount').value) || 0;
    const additionDesc = document.getElementById('meta-addition-desc').value.trim() || t('手动增加', 'Manual Addition');
    const deductionVal = parseFloat(document.getElementById('meta-deduction-amount').value) || 0;
    const deductionDesc = document.getElementById('meta-deduction-desc').value.trim() || t('手动扣减', 'Manual Deduction');

    if (additionVal > 0) {
        document.getElementById('sum-line-addition').style.display = 'flex';
        document.getElementById('sum-label-addition').textContent = additionDesc + " (Addition)";
        document.getElementById('sum-val-addition').textContent = "+$" + additionVal.toFixed(2);
    } else {
        document.getElementById('sum-line-addition').style.display = 'none';
    }

    if (deductionVal > 0) {
        document.getElementById('sum-line-deduction').style.display = 'flex';
        document.getElementById('sum-label-deduction').textContent = deductionDesc + " (Deduction)";
        document.getElementById('sum-val-deduction').textContent = "-$" + deductionVal.toFixed(2);
    } else {
        document.getElementById('sum-line-deduction').style.display = 'none';
    }

    const grandTotal = subtotal + rodCost + shippingVal + oversizedCost + additionVal - deductionVal;

    document.getElementById('sum-wholesale-subtotal').textContent = "$" + subtotal.toFixed(2);
    document.getElementById('sum-oversized-cost').textContent = "$" + oversizedCost.toFixed(2);
    document.getElementById('sum-rod-cost').textContent = "$" + rodCost.toFixed(2);
    document.getElementById('sum-shipping').textContent = "$" + shippingVal.toFixed(2);
    document.getElementById('sum-grand-total').textContent = "$" + grandTotal.toFixed(2);
}

// 8. Materials Tab Rendering
function renderMaterialsTable() {
    const tbody = document.getElementById('materials-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    MATERIALS_DB.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.seq}</td>
            <td><strong>${item.pattern_code}</strong></td>
            <td>${item.collection}</td>
            <td>${item.code}</td>
            <td>${item.color}</td>
            <td><span class="item-group-badge">Group ${item.group}</span></td>
            <td>${item.width}</td>
            <td>${item.weight}</td>
            <td>${item.composition}</td>
        `;
        tbody.appendChild(tr);
    });

    const searchInput = document.getElementById('materials-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const filter = this.value.toUpperCase().trim();
            const rows = tbody.getElementsByTagName('tr');
            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName('td');
                if (cells.length > 0) {
                    const pattern = cells[1].textContent || cells[1].innerText;
                    const coll = cells[2].textContent || cells[2].innerText;
                    const color = cells[4].textContent || cells[4].innerText;
                    if (pattern.toUpperCase().indexOf(filter) > -1 ||
                        coll.toUpperCase().indexOf(filter) > -1 ||
                        color.toUpperCase().indexOf(filter) > -1) {
                        rows[i].style.display = "";
                    } else {
                        rows[i].style.display = "none";
                    }
                }
            }
        });
    }
}

// 9. Excel Upload and Parse
function setupExcelUpload() {
    const uploadZone = document.getElementById('upload-zone');
    const fileUploader = document.getElementById('file-uploader');

    if (!uploadZone || !fileUploader) return;

    uploadZone.addEventListener('click', () => {
        fileUploader.click();
    });

    fileUploader.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
            parseExcelOrderFile(files[0]);
            fileUploader.value = '';
        }
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--color-primary)';
        uploadZone.style.backgroundColor = 'rgba(74, 91, 66, 0.05)';
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = 'var(--color-border)';
        uploadZone.style.backgroundColor = 'rgba(74, 91, 66, 0.01)';
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--color-border)';
        uploadZone.style.backgroundColor = 'rgba(74, 91, 66, 0.01)';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            parseExcelOrderFile(files[0]);
            fileUploader.value = '';
        }
    });
}

function parseExcelOrderFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        let targetSheetName = workbook.SheetNames[0];
        let foundTarget = false;

        for (let name of workbook.SheetNames) {
            const sheet = workbook.Sheets[name];
            const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
            for (let r = range.s.r; r <= Math.min(range.e.r, 25); r++) {
                const aVal = String(getCellValue(sheet, r, 0)).trim();
                const bVal = String(getCellValue(sheet, r, 1)).trim().toUpperCase();
                if (aVal === '#' && bVal === 'ROOM') {
                    targetSheetName = name;
                    foundTarget = true;
                    break;
                }
            }
            if (foundTarget) break;
        }

        const sheet = workbook.Sheets[targetSheetName];
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');

        let metadata = { customer: '', po: '', sidemark: '', phone: '', address: '', city: '', state: '' };

        for (let r = range.s.r; r <= Math.min(range.e.r, 20); r++) {
            for (let c = range.s.c; c <= range.e.c; c++) {
                const val = String(getCellValue(sheet, r, c)).trim();
                if (/DEALER NAME:/i.test(val)) {
                    metadata.customer = getCellValue(sheet, r, c + 2) || getCellValue(sheet, r, c + 1);
                } else if (/PO NUMBER:/i.test(val)) {
                    metadata.po = getCellValue(sheet, r, c + 2) || getCellValue(sheet, r, c + 1);
                } else if (/SIDEMARK:/i.test(val)) {
                    metadata.sidemark = getCellValue(sheet, r, c + 2) || getCellValue(sheet, r, c + 1);
                } else if (/PHONE:/i.test(val)) {
                    metadata.phone = getCellValue(sheet, r, c + 2) || getCellValue(sheet, r, c + 1);
                } else if (/ADDRESS:/i.test(val)) {
                    metadata.address = getCellValue(sheet, r, c + 2) || getCellValue(sheet, r, c + 1);
                } else if (/CITY:/i.test(val)) {
                    metadata.city = getCellValue(sheet, r, c + 2) || getCellValue(sheet, r, c + 1);
                } else if (/STATE:/i.test(val)) {
                    metadata.state = getCellValue(sheet, r, c + 2) || getCellValue(sheet, r, c + 1);
                }
            }
        }

        if (metadata.customer) document.getElementById('meta-customer').value = String(metadata.customer).trim();
        if (metadata.po) document.getElementById('meta-po').value = String(metadata.po).trim();
        if (metadata.sidemark) document.getElementById('meta-sidemark').value = String(metadata.sidemark).trim();
        if (metadata.phone) document.getElementById('meta-phone').value = String(metadata.phone).trim();
        if (metadata.address) document.getElementById('meta-address').value = String(metadata.address).trim();

        let headerRowIdx = null;
        for (let r = range.s.r; r <= range.e.r; r++) {
            const aVal = String(getCellValue(sheet, r, 0)).trim();
            const bVal = String(getCellValue(sheet, r, 1)).trim().toUpperCase();
            if (aVal === '#' && bVal === 'ROOM') {
                headerRowIdx = r;
                break;
            }
        }

        if (headerRowIdx === null) {
            alert('未找到有效的订单明细行！');
            return;
        }

        let colMap = {};
        for (let c = range.s.c; c <= range.e.c; c++) {
            const headerVal = String(getCellValue(sheet, headerRowIdx, c)).toLowerCase().trim().replace(/\s+/g, ' ');
            if (headerVal === '#') colMap.num = c;
            else if (headerVal.includes('room')) colMap.room = c;
            else if (headerVal.includes('qty')) colMap.qty = c;
            else if (headerVal.includes('mount') || headerVal.includes('in/out') || headerVal.includes('mt')) colMap.mount = c;
            else if (headerVal.includes('width')) colMap.width = c;
            else if (headerVal.includes('height')) colMap.height = c;
            else if (headerVal.includes('lining') || headerVal.includes('liner')) colMap.lining = c;
            else if (headerVal.includes('shade style') || (headerVal.includes('style') && !headerVal.includes('options') && !headerVal.includes('header'))) colMap.shade_style = c;
            else if (headerVal.includes('lift') || headerVal.includes('control')) colMap.lift = c;
            else if (headerVal.includes('valance')) colMap.valance = c;
            else if (headerVal.includes('trim')) colMap.trim = c;
            else if (headerVal.includes('special') || headerVal.includes('instructions')) colMap.special = c;
            else if (headerVal.includes('hanging header') || headerVal.includes('header style')) colMap.header_style = c;
            else if (headerVal.includes('panel')) colMap.panel_type = c;
            else if (headerVal.includes('track')) colMap.track = c;
            else if (headerVal.includes('notes')) colMap.notes = c;
        }

        let fabricCols = [];
        for (let c = range.s.c; c <= range.e.c; c++) {
            const val = String(getCellValue(sheet, headerRowIdx, c)).toLowerCase();
            if (val.includes('pattern') || val.includes('fabric') || val.includes('product')) {
                fabricCols.push(c);
            }
        }
        if (fabricCols.length >= 2) {
            colMap.fabric = fabricCols[0];
            colMap.pattern_name = fabricCols[1];
        } else if (fabricCols.length === 1) {
            colMap.fabric = fabricCols[0];
            colMap.pattern_name = fabricCols[0];
        }

        let fileIsRoman = false;
        for (let c = range.s.c; c <= range.e.c; c++) {
            const val = String(getCellValue(sheet, headerRowIdx, c)).toLowerCase();
            if (val.includes('shade style') || val.includes('lift') || val.includes('in/out')) {
                fileIsRoman = true;
                break;
            }
        }

        let widthHeader = colMap.width !== undefined ? String(getCellValue(sheet, headerRowIdx, colMap.width)).toUpperCase() : '';
        let isMeter = widthHeader.includes('METER') || widthHeader.includes('米');

        let importedItems = [];
        let isParsingRods = false;

        for (let r = headerRowIdx + 1; r <= range.e.r; r++) {
            const numVal = String(getCellValue(sheet, r, colMap.num || 0)).trim();
            const roomVal = String(getCellValue(sheet, r, colMap.room || 1)).trim();

            if (numVal.toUpperCase().includes('BLACK ROD') || roomVal.toUpperCase().includes('ROD')) {
                isParsingRods = true;
            }

            if (!/^[0-9]+$/.test(numVal)) continue;

            const qty = parseInt(getCellValue(sheet, r, colMap.qty)) || 1;
            const widthRaw = String(getCellValue(sheet, r, colMap.width)).trim();
            const heightRaw = colMap.height !== undefined ? String(getCellValue(sheet, r, colMap.height)).trim() : '';

            if (!widthRaw) continue;

            let w = parseDimension(widthRaw);
            let h = heightRaw ? parseDimension(heightRaw) : 0;

            if (isMeter) {
                w = Math.round(w * 39.3701 * 1000) / 1000;
                h = Math.round(h * 39.3701 * 1000) / 1000;
            }

            const special = colMap.special !== undefined ? String(getCellValue(sheet, r, colMap.special)).trim() : '';
            const notes = colMap.notes !== undefined ? String(getCellValue(sheet, r, colMap.notes)).trim() : '';
            const mount = colMap.mount !== undefined ? String(getCellValue(sheet, r, colMap.mount)).trim() : 'IM';

            const hasMultipleFabrics = colMap.fabric !== undefined && colMap.pattern_name !== undefined && colMap.fabric !== colMap.pattern_name;
            const rawFabricCode1 = colMap.fabric !== undefined ? String(getCellValue(sheet, r, colMap.fabric)).trim() : '';
            const rawFabricCode2 = colMap.pattern_name !== undefined ? String(getCellValue(sheet, r, colMap.pattern_name)).trim() : '';
            const isDoubleLayer = !fileIsRoman && hasMultipleFabrics && rawFabricCode1 !== '' && rawFabricCode1 !== 'N/A' && rawFabricCode2 !== '' && rawFabricCode2 !== 'N/A';

            let itemsToImport = [];

            if (isDoubleLayer) {
                // Parse Fabric Layer (Item 1)
                let fabricCode1 = rawFabricCode1;
                let fabricGroup1 = 'H';
                const matchedMat1 = findMaterialInDb(fabricCode1, '');
                if (matchedMat1) {
                    fabricGroup1 = matchedMat1.group;
                    fabricCode1 = matchedMat1.code || matchedMat1.pattern_code;
                } else {
                    const ext1 = extractFabricGroup(fabricCode1, '');
                    if (ext1) fabricGroup1 = ext1;
                }

                let item1 = {
                    number: importedItems.length + 1,
                    room: roomVal || `Room ${numVal}`,
                    qty: qty,
                    width: w,
                    width_raw: w.toString(),
                    height: h,
                    height_raw: h.toString(),
                    fabric_code: fabricCode1,
                    fabric_group: fabricGroup1,
                    mount: mount.toUpperCase().includes('OM') || mount.toUpperCase().includes('OB') ? 'OM' : 'IM',
                    special_instructions: special || notes,
                    is_sheer_force_regular: true
                };

                // Parse Sheer Layer (Item 2)
                let fabricCode2 = rawFabricCode2;
                let fabricGroup2 = 'H';
                const matchedMat2 = findMaterialInDb(fabricCode2, '');
                if (matchedMat2) {
                    fabricGroup2 = matchedMat2.group;
                    fabricCode2 = matchedMat2.code || matchedMat2.pattern_code;
                } else {
                    const ext2 = extractFabricGroup(fabricCode2, '');
                    if (ext2) fabricGroup2 = ext2;
                }

                let item2 = {
                    number: importedItems.length + 2,
                    room: roomVal || `Room ${numVal}`,
                    qty: qty,
                    width: w,
                    width_raw: w.toString(),
                    height: h,
                    height_raw: h.toString(),
                    fabric_code: fabricCode2,
                    fabric_group: fabricGroup2,
                    mount: mount.toUpperCase().includes('OM') || mount.toUpperCase().includes('OB') ? 'OM' : 'IM',
                    special_instructions: (special || notes) ? ((special || notes) + ' (Sheer Layer / 纱帘)') : '(Sheer Layer / 纱帘)',
                    is_sheer_force_sheer: true
                };

                itemsToImport.push(item1, item2);
            } else {
                let fabricCode = rawFabricCode1;
                let fabricGroup = 'H';
                const matchedMat = findMaterialInDb(fabricCode, rawFabricCode2);
                if (matchedMat) {
                    fabricGroup = matchedMat.group;
                    fabricCode = matchedMat.code || matchedMat.pattern_code;
                } else {
                    const ext = extractFabricGroup(fabricCode, rawFabricCode2);
                    if (ext) fabricGroup = ext;
                }

                let item = {
                    number: importedItems.length + 1,
                    room: roomVal || `Room ${numVal}`,
                    qty: qty,
                    width: w,
                    width_raw: w.toString(),
                    height: h,
                    height_raw: h.toString(),
                    fabric_code: fabricCode,
                    fabric_group: fabricGroup,
                    mount: mount.toUpperCase().includes('OM') || mount.toUpperCase().includes('OB') ? 'OM' : 'IM',
                    special_instructions: special || notes
                };
                itemsToImport.push(item);
            }

            itemsToImport.forEach(item => {
                item.number = importedItems.length + 1;
                if (isParsingRods) {
                    item.type = 'rod';
                } else if (fileIsRoman) {
                    item.type = 'roman';

                    const styleVal = colMap.shade_style !== undefined ? String(getCellValue(sheet, r, colMap.shade_style)).toLowerCase() : '';
                    if (styleVal.includes('hobbled')) item.shade_style = 'hobbled';
                    else if (styleVal.includes('tdbu')) item.shade_style = 'tdbu';
                    else if (styleVal.includes('twin')) item.shade_style = 'twin';
                    else if (styleVal.includes('flat')) item.shade_style = 'flat';
                    else if (styleVal.includes('balloon') || styleVal.includes('气球')) item.shade_style = 'balloon';
                    else item.shade_style = 'plain';

                    const liftVal = colMap.lift !== undefined ? String(getCellValue(sheet, r, colMap.lift)).toLowerCase() : '';
                    const isMotorReady = liftVal.includes('motor ready') || liftVal.includes('motor-ready') || liftVal.includes('dooya motor ready') || liftVal.includes('no motor') || liftVal.includes('without motor');

                    if (isMotorReady) {
                        item.lift_control = 'cordless';
                    } else if (liftVal.includes('motorized') || liftVal.includes('motor')) {
                        if (liftVal.includes('28') || liftVal.includes('am28')) item.lift_control = 'motorized_28';
                        else if (liftVal.includes('35') || liftVal.includes('am35')) item.lift_control = 'motorized_35';
                        else item.lift_control = 'motorized_25';
                    } else if (liftVal.includes('ccl') || liftVal.includes('loop')) {
                        item.lift_control = 'ccl';
                    } else {
                        item.lift_control = 'cordless';
                    }

                    const valanceVal = colMap.valance !== undefined ? String(getCellValue(sheet, r, colMap.valance)).toLowerCase().trim() : '';
                    let isValanceCharged = false;
                    if (valanceVal.includes('standard') || valanceVal.includes('std') || valanceVal.includes('b=') || valanceVal === 'b' || valanceVal.includes('yes') || valanceVal.includes('y') || valanceVal.includes('valance') || valanceVal.includes('帷幔')) {
                        isValanceCharged = true;
                    }
                    if (valanceVal.includes('waterfall') || valanceVal.includes('a=') || valanceVal === 'a' || valanceVal.includes('no') || valanceVal === 'none' || valanceVal === '') {
                        isValanceCharged = false;
                    }
                    item.valance = isValanceCharged ? 'yes' : 'no';

                    item.accessories = 'none';
                    const allNotes = (special + ' ' + notes + ' ' + liftVal).toLowerCase();
                    if (allNotes.includes('remote') || allNotes.includes('遥控')) item.accessories = 'remote';
                    else if (allNotes.includes('hub') || allNotes.includes('网关')) item.accessories = 'wifi';
                    else if (allNotes.includes('charger') || allNotes.includes('充电')) item.accessories = 'charger';

                    const liningVal = colMap.lining !== undefined ? String(getCellValue(sheet, r, colMap.lining)).toLowerCase() : '';
                    if (item.is_sheer_force_sheer) item.lining = 'unlined';
                    else if (liningVal.includes('blackout') || liningVal.includes('bo')) item.lining = 'blackout';
                    else if (liningVal.includes('unlined')) item.lining = 'unlined';
                    else item.lining = 'privacy';

                    const trimVal = colMap.trim !== undefined ? String(getCellValue(sheet, r, colMap.trim)).toLowerCase().trim() : '';
                    if (!trimVal || trimVal === 'none' || trimVal === 'no' || trimVal === '0') {
                        item.trim = 'none';
                    } else if (trimVal.includes('special') || trimVal.includes('t73') || trimVal.includes('8')) {
                        item.trim = 'special';
                    } else {
                        item.trim = 'standard';
                    }

                } else {
                    item.type = 'drapery';

                    const headerVal = colMap.header_style !== undefined ? String(getCellValue(sheet, r, colMap.header_style)).toLowerCase() : '';
                    if (headerVal.includes('ripple')) {
                        item.header_style = 'ripple_fold';
                    } else if (headerVal.includes('inverted')) {
                        item.header_style = 'inverted';
                    } else if (headerVal.includes('triple')) {
                        item.header_style = 'triple_pinch';
                    } else {
                        item.header_style = 'double_pinch';
                    }

                    const panelVal = colMap.panel_type !== undefined ? String(getCellValue(sheet, r, colMap.panel_type)).toLowerCase() : '';
                    item.panel_type = panelVal.includes('single') ? 'single' : 'pair';

                    const liningVal = colMap.lining !== undefined ? String(getCellValue(sheet, r, colMap.lining)).toLowerCase() : '';
                    if (item.is_sheer_force_sheer) item.lining = 'none';
                    else if (liningVal.includes('blackout') || liningVal.includes('bo')) item.lining = 'blackout';
                    else if (liningVal.includes('interlining') || liningVal.includes('加厚')) item.lining = 'interlining';
                    else if (liningVal.includes('privacy') || liningVal.includes('lf') || liningVal.includes('light filtering') || liningVal.includes('light-filtering') || liningVal.includes('透光') || liningVal.includes('常规') || liningVal.includes('防晒')) item.lining = 'privacy';
                    else item.lining = 'none';

                    const trackVal = colMap.track !== undefined ? String(getCellValue(sheet, r, colMap.track)).toLowerCase() : '';
                    item.track = trackVal.includes('traverse') || trackVal.includes('rod') ? 'traverse_rod' : 'none';

                    const trimVal = colMap.trim !== undefined ? String(getCellValue(sheet, r, colMap.trim)).toLowerCase().trim() : '';
                    if (!trimVal || trimVal === 'none' || trimVal === 'no' || trimVal === '0') {
                        item.trim = 'none';
                    } else if (trimVal.includes('special') || trimVal.includes('t73') || trimVal.includes('8')) {
                        item.trim = 'special';
                    } else {
                        item.trim = 'standard';
                    }

                    item.pleat_upgrade = 'no';
                    item.tieband = 'no';
                }

                item.pricing = calculateItemPrice(item);
                importedItems.push(item);
            });
        }

        // Auto-merge split twin shades (front/back fabrics on separate rows)
        let mergedItems = [];
        let i = 0;
        while (i < importedItems.length) {
            let curr = importedItems[i];
            if (i + 1 < importedItems.length) {
                let nxt = importedItems[i + 1];
                let sameType = curr.type === 'roman' && nxt.type === 'roman';
                let sameRoom = curr.room === nxt.room;
                let sameSize = Math.abs(curr.width - nxt.width) < 0.1 && Math.abs(curr.height - nxt.height) < 0.1;

                let isSheer = function(fc) {
                    if (!fc) return false;
                    let clean = fc.toUpperCase().trim();
                    return clean.startsWith('SB') || clean.startsWith('SH') || clean.startsWith('DTS') || clean.startsWith('DS') || clean.includes('SHEER');
                };

                let currSheer = isSheer(curr.fabric_code);
                let nxtSheer = isSheer(nxt.fabric_code);
                let oneSheerOneStd = (currSheer && !nxtSheer) || (!currSheer && nxtSheer);

                if (sameType && sameRoom && sameSize && oneSheerOneStd) {
                    let stdItem = currSheer ? nxt : curr;
                    let sheerItem = currSheer ? curr : nxt;

                    stdItem.fabric_code = "Front : " + stdItem.fabric_code + "\nBack : " + sheerItem.fabric_code + "(Sheer)";
                    if (stdItem.pattern_name || sheerItem.pattern_name) {
                        stdItem.pattern_name = "Front : " + (stdItem.pattern_name || '') + "\nBack : " + (sheerItem.pattern_name || '');
                    }
                    stdItem.shade_style = "twin";
                    stdItem.lift_control = "cordless";

                    let stdLining = (stdItem.lining || '').toLowerCase();
                    let sheerLining = (sheerItem.lining || '').toLowerCase();
                    if (stdLining.includes('blackout') || sheerLining.includes('blackout') || stdLining.includes('bo') || sheerLining.includes('bo')) {
                        stdItem.lining = 'blackout';
                    } else {
                        stdItem.lining = 'privacy';
                    }

                    if (sheerItem.valance === 'yes') {
                        stdItem.valance = 'yes';
                    }

                    let combinedSpecial = stdItem.special_instructions || '';
                    if (sheerItem.special_instructions && sheerItem.special_instructions !== combinedSpecial) {
                        combinedSpecial += (combinedSpecial ? '\n' : '') + sheerItem.special_instructions;
                    }
                    stdItem.special_instructions = combinedSpecial;

                    stdItem.pricing = calculateItemPrice(stdItem);

                    mergedItems.push(stdItem);
                    i += 2;
                    continue;
                }
            }
            mergedItems.push(curr);
            i++;
        }

        for (let idx = 0; idx < mergedItems.length; idx++) {
            mergedItems[idx].number = idx + 1;
        }
        importedItems = mergedItems;

        if (importedItems.length > 0) {
            const hasRods = importedItems.some(item => item.type === 'rod');
            let shippingFee = 0;
            if (hasRods) {
                shippingFee = calculateRodShippingFee(metadata.city || '', metadata.state || '');
            }
            document.getElementById('meta-shipping').value = shippingFee.toFixed(2);

            currentOrderItems = currentOrderItems.concat(importedItems);
            renderItemsTable();
            alert("成功导入 " + importedItems.length + " 个定制产品！");
        } else {
            alert('未找到有效的订单明细数据！');
        }
    };
    reader.readAsArrayBuffer(file);
}

function getCellValue(sheet, r, c) {
    if (c === undefined || c === null || c < 0) return '';
    const cellAddress = XLSX.utils.encode_cell({ r: r, c: c });
    const cell = sheet[cellAddress];
    return cell ? (cell.v !== undefined && cell.v !== null ? cell.v : '') : '';
}

// 10. Action Buttons setup (Print & Excel Exports)
function setupActionButtons() {
    const printQuoteBtn = document.getElementById('btn-print-quote');
    if (printQuoteBtn) {
        printQuoteBtn.addEventListener('click', () => {
            if (currentOrderItems.length === 0) {
                alert('报价细目表为空！');
                return;
            }
            populatePrintQuoteTemplate();
            // 清空加工单模板，防止同时打印
            const fabTemp = document.getElementById('print-fab-template');
            if (fabTemp) fabTemp.innerHTML = '';
            window.print();
        });
    }

    const exportLongInvoiceBtn = document.getElementById('btn-export-long-invoice');
    if (exportLongInvoiceBtn) {
        exportLongInvoiceBtn.addEventListener('click', exportLongInvoicePdf);
    }

    const printFabBtn = document.getElementById('btn-print-fab');
    if (printFabBtn) {
        printFabBtn.addEventListener('click', () => {
            if (currentOrderItems.length === 0) {
                alert('报价细目表为空！');
                return;
            }
            populatePrintFabTemplate();
            // 清空报价单模板，防止同时打印
            const quoteTemp = document.getElementById('print-quote-template');
            if (quoteTemp) quoteTemp.innerHTML = '';
            window.print();
        });
    }

    const btnGenContract = document.getElementById('btn-gen-contract');
    if (btnGenContract) {
        btnGenContract.addEventListener('click', exportContractExcel);
    }
    const btnGenFab = document.getElementById('btn-gen-fab');
    if (btnGenFab) {
        btnGenFab.addEventListener('click', exportFabricationExcel);
    }

    // Event listeners for shipping, additions, deductions
    const globalInputs = ['meta-shipping', 'meta-addition-amount', 'meta-addition-desc', 'meta-deduction-amount', 'meta-deduction-desc'];
    globalInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateTotalsDisplay);
        }
    });

    // Email send button
    const emailBtn = document.getElementById('btn-send-email');
    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            if (currentOrderItems.length === 0) {
                alert('报价细目表为空，无法发送邮件！');
                return;
            }
            const confirmMsg = `【一键生成邮件 PDF 发送提示】

由于浏览器安全限制，网页端无法直接在邮件中自动添加本地文件附件。

1. 我们将首先为您打开打印窗口，请在设置中选择“另存为 PDF” (Save as PDF) 将 Invoice 保存到您的电脑。
2. 随后系统将自动为您拉起邮件客户端，您只需将刚刚保存的 PDF 文件作为附件拖入邮件中发送。

点击“确定”开始保存 PDF 并起草邮件。`;
            if (confirm(confirmMsg)) {
                // 1. 渲染打印区域
                populatePrintQuoteTemplate();
                // 清空加工单模板，防止同时打印
                const fabTemp = document.getElementById('print-fab-template');
                if (fabTemp) fabTemp.innerHTML = '';
                // 2. 保存 PDF
                window.print();
                // 3. 延时唤起邮件客户端
                setTimeout(sendEmailNotification, 500);
            }
        });
    }

    setupPhotoUpload();
}

async function exportLongInvoicePdf() {
    if (currentOrderItems.length === 0) {
        alert('报价细目表为空，无法下载 Invoice！');
        return;
    }
    if (typeof window.html2pdf !== 'function') {
        alert('PDF 组件尚未加载，请刷新页面后重试。');
        return;
    }

    const button = document.getElementById('btn-export-long-invoice');
    const originalLabel = button ? button.textContent : '';
    if (button) {
        button.disabled = true;
        button.textContent = '正在生成长图 PDF…';
    }

    try {
        populatePrintQuoteTemplate();
        const fabTemplate = document.getElementById('print-fab-template');
        if (fabTemplate) fabTemplate.innerHTML = '';
        const template = document.getElementById('print-quote-template');
        const sheet = template && template.querySelector('.print-invoice-sheet');
        if (!template || !sheet) throw new Error('Invoice 模板生成失败');

        document.body.classList.add('exporting-long-invoice');
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        if (document.fonts && document.fonts.ready) await document.fonts.ready;

        const width = Math.max(sheet.scrollWidth, 1);
        const height = Math.max(sheet.scrollHeight, 1);
        const pageWidthMm = 210;
        const pageHeightMm = Math.max(297, Math.ceil(pageWidthMm * height / width));
        const po = (document.getElementById('meta-po').value || 'Order').replace(/[^a-zA-Z0-9_-]+/g, '_');

        await window.html2pdf().set({
            margin: 0,
            filename: `Invoice_PO_${po}_Long.pdf`,
            image: { type: 'jpeg', quality: 0.96 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
            jsPDF: { unit: 'mm', format: [pageWidthMm, pageHeightMm], orientation: 'portrait', compress: true },
            pagebreak: { mode: [] }
        }).from(sheet).save();
    } catch (error) {
        console.error(error);
        alert(error && error.message ? error.message : '长图 PDF 生成失败，请刷新页面后重试。');
    } finally {
        document.body.classList.remove('exporting-long-invoice');
        if (button) {
            button.disabled = false;
            button.textContent = originalLabel || '下载 Invoice 长图 PDF';
        }
    }
}

function sendEmailNotification() {
    if (currentOrderItems.length === 0) {
        alert('报价细目表为空，无法发送邮件！');
        return;
    }

    const customer = document.getElementById('meta-customer').value || '';
    const po = document.getElementById('meta-po').value || '';
    const sidemark = document.getElementById('meta-sidemark').value || '';
    const phone = document.getElementById('meta-phone').value || '';
    const address = document.getElementById('meta-address').value || '';

    let subject = `Jin Park CWF Invoice: PO ${po} - ${customer}`;
    if (sidemark) subject += ` (${sidemark})`;

    let body = `Dear Team,

Please find the window treatment invoice details below:

`;
    body += `Dealer/Customer: ${customer}
`;
    body += `PO Number: ${po}
`;
    if (sidemark) body += `Sidemark: ${sidemark}
`;
    if (phone) body += `Phone: ${phone}
`;
    if (address) body += `Shipping Address: ${address}
`;
    body += `
`;
    body += `--- Invoice Summary ---
`;

    currentOrderItems.forEach(item => {
        let typeLabel = item.type === 'roman' ? '罗马帘' : (item.type === 'drapery' ? '窗帘' : (item.type === 'manual' ? '手动调整' : '轨道'));
        let size = item.type === 'manual' ? '-' : (item.type === 'rod' ? `${item.width_raw}"` : `${item.width_raw}" × ${item.height_raw}"`);
        body += `#${item.number}: [${typeLabel}] ${item.room} - Size: ${size} - Qty: ${item.qty} - Rate: $${item.pricing.rate.toFixed(2)} - Amount: $${item.pricing.amount.toFixed(2)}
`;
        body += `   Description: ${item.pricing.desc}
`;
        if (item.special_instructions) {
            body += `   Notes: ${item.special_instructions}
`;
        }
        body += `
`;
    });

    const subtotal = document.getElementById('sum-wholesale-subtotal').textContent;
    const oversized = document.getElementById('sum-oversized-cost').textContent;
    const hardware = document.getElementById('sum-rod-cost').textContent;
    const shipping = document.getElementById('sum-shipping').textContent;

    body += `--------------------
`;
    body += `Products Subtotal: ${subtotal}
`;
    body += `Oversized Surcharge: ${oversized}
`;
    body += `Hardware & Rods: ${hardware}
`;
    body += `Shipping Fee: ${shipping}
`;

    const additionVal = parseFloat(document.getElementById('meta-addition-amount').value) || 0;
    const additionDesc = document.getElementById('meta-addition-desc').value.trim() || '手动增加';
    if (additionVal > 0) {
        body += `${additionDesc}: +$${additionVal.toFixed(2)}
`;
    }

    const deductionVal = parseFloat(document.getElementById('meta-deduction-amount').value) || 0;
    const deductionDesc = document.getElementById('meta-deduction-desc').value.trim() || '手动扣减';
    if (deductionVal > 0) {
        body += `${deductionDesc}: -$${deductionVal.toFixed(2)}
`;
    }

    const total = document.getElementById('sum-grand-total').textContent;
    body += `GRAND TOTAL: ${total}

`;
    body += `Best regards,
`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
}

function setupPhotoUpload() {
    const btnCamera = document.getElementById('btn-camera');
    const itemPhotoInput = document.getElementById('item-photo');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPreview = document.getElementById('photo-preview');
    const btnRemovePhoto = document.getElementById('btn-remove-photo');

    if (!btnCamera || !itemPhotoInput) return;

    btnCamera.addEventListener('click', () => {
        itemPhotoInput.click();
    });

    itemPhotoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                tempPhotoDataUrl = evt.target.result;
                if (photoPreview && photoPreviewContainer) {
                    photoPreview.src = tempPhotoDataUrl;
                    photoPreviewContainer.style.display = 'flex';
                }
            };
            reader.readAsDataURL(file);
        }
    });

    if (btnRemovePhoto) {
        btnRemovePhoto.addEventListener('click', () => {
            tempPhotoDataUrl = '';
            itemPhotoInput.value = '';
            if (photoPreviewContainer) {
                photoPreviewContainer.style.display = 'none';
            }
            if (photoPreview) {
                photoPreview.src = '';
            }
        });
    }
}

// Populate Print Contract Template
function populatePrintQuoteTemplate() {
    const template = document.getElementById('print-quote-template');
    if (!template) return;

    const customer = document.getElementById('meta-customer').value || 'N/A';
    const po = document.getElementById('meta-po').value || 'N/A';
    const sidemark = document.getElementById('meta-sidemark').value || 'N/A';
    const phone = document.getElementById('meta-phone').value || 'N/A';
    const address = document.getElementById('meta-address').value || 'N/A';
    const shipping = parseFloat(document.getElementById('meta-shipping').value) || 0;

    let itemsRowsHtml = '';
    let subtotal = 0;
    let rodCost = 0;
    let oversizedCount = 0;

    currentOrderItems.forEach((item, idx) => {
        let typeLabel = item.type === 'roman' ? 'Roman Shade' : (item.type === 'drapery' ? 'Drapery' : (item.type === 'manual' ? 'Adjustment' : 'Hardware'));
        let sizeLabel = item.type === 'manual' ? '-' : (item.type === 'rod' ? item.width_raw + '"' : item.width_raw + '" × ' + item.height_raw + '"');
        let productDesc = item.fabric_code ? item.fabric_code : 'N/A';
        if (item.type !== 'rod' && item.type !== 'manual') {
            productDesc += " (" + item.lining + ")";
        } else if (item.type === 'manual') {
            productDesc = "Adjustment";
        }

        let instructions = item.special_instructions || '';
        if (item.mount && item.type !== 'rod' && item.type !== 'manual') {
            instructions = "[" + item.mount + "] " + instructions;
        }

        let imgHtml = '';
        if (item.image) {
            imgHtml = `<br><img src="${item.image}" alt="photo" style="width: 40px; height: 40px; object-fit: cover; border-radius: 3px; border: 1px solid #ddd; margin-top: 2px;">`;
        }

        itemsRowsHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${item.room}</strong>${imgHtml}</td>
                <td>${item.qty}</td>
                <td>${typeLabel}</td>
                <td>${sizeLabel}</td>
                <td>${productDesc}</td>
                <td style="white-space: pre-wrap;">${item.pricing.desc}</td>
                <td>$${item.pricing.rate.toFixed(2)}</td>
                <td>$${item.pricing.amount.toFixed(2)}</td>
                <td style="white-space: pre-wrap;">${instructions}</td>
            </tr>
        `;

        if (item.type === 'rod') {
            rodCost += item.pricing.amount;
        } else {
            subtotal += item.pricing.amount;
            if (item.type === 'roman' && item.pricing.isOversized) {
                oversizedCount += item.qty;
            }
            if (item.pricing.extraRodCost) {
                rodCost += item.pricing.extraRodCost;
                subtotal -= item.pricing.extraRodCost;
            }
        }
    });

    let oversizedCost = 0;
    if (oversizedCount > 0) {
        oversizedCost = 50 + (oversizedCount - 1) * 25;
    }

    const additionVal = parseFloat(document.getElementById('meta-addition-amount').value) || 0;
    const additionDesc = document.getElementById('meta-addition-desc').value.trim() || 'Manual Addition';
    const deductionVal = parseFloat(document.getElementById('meta-deduction-amount').value) || 0;
    const deductionDesc = document.getElementById('meta-deduction-desc').value.trim() || 'Manual Deduction';

    let additionRowHtml = '';
    if (additionVal > 0) {
        additionRowHtml = `
            <tr>
                <td>${additionDesc}</td>
                <td>$${additionVal.toFixed(2)}</td>
            </tr>
        `;
    }

    let deductionRowHtml = '';
    if (deductionVal > 0) {
        deductionRowHtml = `
            <tr>
                <td>${deductionDesc}</td>
                <td>-$${deductionVal.toFixed(2)}</td>
            </tr>
        `;
    }

    const grandTotal = subtotal + rodCost + shipping + oversizedCost + additionVal - deductionVal;

    template.innerHTML = `
        <div class="print-invoice-sheet">
            <div class="print-invoice-body">
                <div class="print-invoice-title-row">
                    <h1>Jin Park Design LLC (CWF)</h1>
                    <span>PROFORMA INVOICE FORM</span>
                </div>
                <div class="print-meta-grid">
                    <div class="print-meta-item"><strong>Customer (Dealer):</strong> ${customer}</div>
                    <div class="print-meta-item"><strong>Invoice / PO#:</strong> ${po}</div>
                    <div class="print-meta-item"><strong>Sidemark / Project:</strong> ${sidemark}</div>
                    <div class="print-meta-item"><strong>Order Date:</strong> ${new Date().toLocaleDateString('zh-CN')}</div>
                    <div class="print-meta-item"><strong>Phone Number:</strong> ${phone}</div>
                    <div class="print-meta-item"><strong>Shipping Address:</strong> ${address}</div>
                </div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th width="4%">NO</th>
                            <th width="12%">Room</th>
                            <th width="5%">Qty</th>
                            <th width="10%">Type</th>
                            <th width="12%">Size (W×H)</th>
                            <th width="15%">Product</th>
                            <th width="20%">Description</th>
                            <th width="8%">Rate</th>
                            <th width="10%">Amount</th>
                            <th width="12%">Instructions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRowsHtml}
                    </tbody>
                </table>
                <div class="print-totals-box">
                    <table class="print-totals-table">
                        <tr>
                            <td>Products Subtotal</td>
                            <td>$${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Oversized Surcharge</td>
                            <td>$${oversizedCost.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Hardware & Rods Cost</td>
                            <td>$${rodCost.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Shipping & Delivery</td>
                            <td>$${shipping.toFixed(2)}</td>
                        </tr>
                        ${additionRowHtml}
                        ${deductionRowHtml}
                        <tr class="grand-total">
                            <td>GRAND TOTAL</td>
                            <td>$${grandTotal.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="print-invoice-footer-container">
                <div class="print-terms-box">
                    <p><strong>Terms and Conditions (Jin Park Pricing System):</strong></p>
                    <p>1. All custom-made window treatments are fabricated strictly to the dimensions provided above.</p>
                    <p>2. Roman Shade prices are calculated on square footage with a minimum of 10 sqft per shade.</p>
                    <p>3. Roman shades wider than 60" are subject to oversized shipping surcharges ($50 for the 1st, $25 for each subsequent piece).</p>
                    <p>4. Draperies are calculated on finished width (min 20" finished width) and height surcharges apply over 104".</p>
                </div>

                <div class="print-signature-row">
                    <div class="print-sig-box">Customer Signature / Date</div>
                    <div class="print-sig-box">Factory Approval Signature</div>
                </div>
            </div>
        </div>
    `;
}

// Populate Print Workshop Fabrication Template
function populatePrintFabTemplate() {
    const template = document.getElementById('print-fab-template');
    if (!template) return;

    const customer = document.getElementById('meta-customer').value || 'N/A';
    const po = document.getElementById('meta-po').value || 'N/A';
    const sidemark = document.getElementById('meta-sidemark').value || 'N/A';
    const phone = document.getElementById('meta-phone').value || 'N/A';
    const address = document.getElementById('meta-address').value || 'N/A';

    let romanItemsHtml = '';
    let draperyItemsHtml = '';
    let hardwareItemsHtml = '';

    let rCount = 0;
    let dCount = 0;
    let hCount = 0;

    currentOrderItems.forEach((item) => {
        let w_cm = (item.width * 2.54).round(1);
        let h_cm = item.type !== 'rod' ? (item.height * 2.54).round(1) : '-';

        if (item.type === 'roman') {
            rCount++;
            let fab = item.fabrication;
            let imgHtml = '';
            if (item.image) {
                imgHtml = `<br><img src="${item.image}" alt="photo" style="width: 35px; height: 35px; object-fit: cover; border-radius: 3px; border: 1px solid #ddd; margin-top: 2px;">`;
            }

            romanItemsHtml += `
                <tr>
                    <td>${item.number}</td>
                    <td><strong>${item.room}</strong>${imgHtml}</td>
                    <td>${item.qty}</td>
                    <td>宽: ${item.width_raw}"<br>高: ${item.height_raw}"</td>
                    <td>宽: ${fab.w_cm} cm<br>高: ${fab.h_cm} cm</td>
                    <td>宽: ${fab.cut_w} cm<br>高: <strong>${fab.cut_h} cm</strong></td>
                    <td>${fab.folds}</td>
                    <td class="marks-text">${fab.marksStr}</td>
                    <td>${fab.cordStr}</td>
                    <td><span style="border:1px solid #000; padding:1px 4px;">${item.mount}</span></td>
                    <td>${item.fabric_code} (组:${item.fabric_group})</td>
                    <td>${item.shade_style} / ${item.lift_control}</td>
                    <td>${item.lining === 'blackout' ? '全遮光内衬' : '常规内衬'}</td>
                    <td>${item.trim !== 'none' ? item.trim : '无'}</td>
                    <td style="white-space: pre-wrap;">${item.special_instructions}</td>
                </tr>
            `;
        } else if (item.type === 'drapery') {
            dCount++;
            let fab = item.fabrication;
            let imgHtml = '';
            if (item.image) {
                imgHtml = `<br><img src="${item.image}" alt="photo" style="width: 35px; height: 35px; object-fit: cover; border-radius: 3px; border: 1px solid #ddd; margin-top: 2px;">`;
            }

            let hooksVal = fab.hooks;
            if (item.panel_type === 'pair') {
                hooksVal = fab.hooks + " / panel (共" + (fab.hooks * 2) + ")";
            }

            draperyItemsHtml += `
                <tr>
                    <td>${item.number}</td>
                    <td><strong>${item.room}</strong>${imgHtml}</td>
                    <td>${item.qty}</td>
                    <td>成品宽: ${item.width_raw}"<br>成品高: ${item.height_raw}"</td>
                    <td>成品宽: ${fab.w_cm} cm<br>成品高: ${fab.h_cm} cm</td>
                    <td>裁剪宽: <strong>${fab.cut_w} cm</strong><br>裁剪高: <strong>${fab.cut_h} cm</strong></td>
                    <td><strong>${fab.fabric} m</strong></td>
                    <td>${hooksVal}</td>
                    <td>${item.fabric_code} (组:${item.fabric_group})</td>
                    <td>${item.header_style} (${fab.fullness}倍) - ${item.panel_type}</td>
                    <td>${item.lining}</td>
                    <td>${item.trim !== 'none' ? item.trim : '无'}</td>
                    <td style="white-space: pre-wrap;">${item.special_instructions}</td>
                </tr>
            `;
        } else if (item.type === 'rod') {
            hCount++;
            let fab = item.fabrication;
            let imgHtml = '';
            if (item.image) {
                imgHtml = `<br><img src="${item.image}" alt="photo" style="width: 35px; height: 35px; object-fit: cover; border-radius: 3px; border: 1px solid #ddd; margin-top: 2px;">`;
            }

            hardwareItemsHtml += `
                <tr>
                    <td>${item.number}</td>
                    <td><strong>${item.room}</strong>${imgHtml}</td>
                    <td>${item.qty}</td>
                    <td>订购长度: ${item.width_raw}"<br>成品长度: ${fab.w_cm} cm</td>
                    <td>滑轨挂轨系统</td>
                    <td style="white-space: pre-wrap;">${item.special_instructions}</td>
                </tr>
            `;
        }
    });

    let romanSectionHtml = rCount > 0 ? `
        <div class="print-fab-section-title">一、 罗马帘车间生产指令 (Roman Shade Fabrication)</div>
        <table class="print-fab-table">
            <thead>
                <tr>
                    <th width="3%">#</th>
                    <th width="6%">位置</th>
                    <th width="4%">数量</th>
                    <th width="8%">成品吋</th>
                    <th width="8%">成品cm</th>
                    <th width="8%">裁剪cm</th>
                    <th width="4%">档数</th>
                    <th width="18%">画线分段 (cm)</th>
                    <th width="8%">拉线/边线</th>
                    <th width="4%">装法</th>
                    <th width="8%">面料</th>
                    <th width="8%">款式系统</th>
                    <th width="6%">内衬</th>
                    <th width="4%">花边</th>
                    <th width="8%">车间备注</th>
                </tr>
            </thead>
            <tbody>
                ${romanItemsHtml}
            </tbody>
        </table>
    ` : '';

    let draperySectionHtml = dCount > 0 ? `
        <div class="print-fab-section-title">二、 窗帘/纱帘裁切与车缝指令 (Drapery Fabrication)</div>
        <table class="print-fab-table">
            <thead>
                <tr>
                    <th width="3%">#</th>
                    <th width="7%">位置</th>
                    <th width="4%">数量</th>
                    <th width="10%">成品吋</th>
                    <th width="10%">成品cm</th>
                    <th width="12%">裁剪尺寸 (cm)</th>
                    <th width="6%">用料 (米)</th>
                    <th width="8%">走珠/挂钩数</th>
                    <th width="8%">面料代码</th>
                    <th width="10%">款式挂法</th>
                    <th width="6%">内衬</th>
                    <th width="5%">花边</th>
                    <th width="11%">特殊备注</th>
                </tr>
            </thead>
            <tbody>
                ${draperyItemsHtml}
            </tbody>
        </table>
    ` : '';

    let hardwareSectionHtml = hCount > 0 ? `
        <div class="print-fab-section-title">三、 五金轨道裁剪工艺单 (Hardware Fabrication)</div>
        <table class="print-fab-table">
            <thead>
                <tr>
                    <th width="4%">#</th>
                    <th width="15%">位置</th>
                    <th width="8%">数量</th>
                    <th width="20%">成品轨道切长</th>
                    <th width="25%">滑挂轨道类型</th>
                    <th width="28%">备注工艺说明</th>
                </tr>
            </thead>
            <tbody>
                ${hardwareItemsHtml}
            </tbody>
        </table>
    ` : '';

    template.innerHTML = `
        <div class="print-fab-sheet">
            <div class="print-fab-header">
                <div>
                    <h1>Jin Park (CWF) 生产制造车间工艺单</h1>
                    <p style="font-size: 8pt; color: #444; margin: 3px 0 0 0;">Dieter Home Custom Window Drapery & Roman Shade Production Instruction</p>
                </div>
                <div style="text-align: right; font-size: 10pt;">
                    <p><strong>Invoice单号 / PO:</strong> ${po}</p>
                    <p><strong>Sidemark:</strong> ${sidemark}</p>
                </div>
            </div>
            <div class="print-fab-meta">
                <div class="print-fab-meta-item"><strong>客户名字:</strong> ${customer}</div>
                <div class="print-fab-meta-item"><strong>电话:</strong> ${phone}</div>
                <div class="print-fab-meta-item"><strong>下单日期:</strong> ${new Date().toLocaleDateString('zh-CN')}</div>
                <div class="print-fab-meta-item"><strong>质检标准:</strong> A级一等品</div>
                <div class="print-fab-meta-item full-width"><strong>配送安装地址:</strong> ${address}</div>
            </div>

            ${romanSectionHtml}
            ${draperySectionHtml}
            ${hardwareSectionHtml}

            <div class="print-fab-guidelines">
                <p><strong>⚠️ 车间技术与缝纫质量规范 (Quality Standards):</strong></p>
                <ol>
                    <li><strong>面料前检</strong>：裁剪前必须仔细对光检验面料，杜绝色差、抽丝及污渍。</li>
                    <li><strong>车缝线迹</strong>：缝线颜色需与面料颜色完美匹配，针距要求在 3.5 针/厘米。折边包缝必须平直，绝不许有起皱拉扯现象。</li>
                    <li><strong>罗马帘组装</strong>：必须确保升降环受力均匀，铝合金轨道升降顺畅，下轨平直，帘体拉起时各折叠层次美观一致。</li>
                </ol>
            </div>
            <div class="print-fab-footer">
                <span>车间主管签字:<span class="print-fab-signature-line"></span> 车缝工签字:<span class="print-fab-signature-line"></span> 日期: ${new Date().toLocaleDateString('zh-CN')}</span>
            </div>
        </div>
    `;
}

// 11. Excel Export - Contract (Proforma Invoice)
function exportContractExcel() {
    if (currentOrderItems.length === 0) {
        alert('没有定制产品数据，无法导出 Invoice！');
        return;
    }

    const customer = document.getElementById('meta-customer').value || '';
    const po = document.getElementById('meta-po').value || '';
    const sidemark = document.getElementById('meta-sidemark').value || '';
    const phone = document.getElementById('meta-phone').value || '';
    const address = document.getElementById('meta-address').value || '';
    const shipping = parseFloat(document.getElementById('meta-shipping').value) || 0;

    const additionVal = parseFloat(document.getElementById('meta-addition-amount').value) || 0;
    const additionDesc = document.getElementById('meta-addition-desc').value.trim() || 'Manual Addition';
    const deductionVal = parseFloat(document.getElementById('meta-deduction-amount').value) || 0;
    const deductionDesc = document.getElementById('meta-deduction-desc').value.trim() || 'Manual Deduction';

    const wb = XLSX.utils.book_new();

    let wsData = [
        ["Jin Park Design LLC (CWF)", "", "", "", "", "", "", "", "Proforma Invoice Form"],
        [],
        [],
        [],
        [],
        ["Invoice#", "", "", po, "", "", "", "", "Order Date", "", new Date().toLocaleDateString('zh-CN')],
        ["Customer", "", "", customer, "", "", "", "", "ETD", "", ""],
        ["Company ID", "", "", "CWF-JIN-001", "", "", "", "", "Shipping Address", "", address],
        ["PO Number", "", "", po, "", "", "", "", "", "", phone],
        ["SIDEMARK:", "", "", sidemark],
        [],
        ["Roman Shades & Draperies Order (Jin Park System)"],
        ["NO", "ROOM", "QTY", "MT", "WIDTH", "HEIGHT", "PRODUCT", "DESCRIPTION", "UOM", "RATE", "AMOUNT", "Special Instructions"]
    ];

    let subtotal = 0;
    let rodCost = 0;
    let oversizedCount = 0;

    currentOrderItems.forEach((item, idx) => {
        let productDesc = item.fabric_code ? item.fabric_code : 'N/A';
        if (item.type !== 'rod' && item.type !== 'manual') {
            productDesc += " (" + item.lining + ")";
        } else if (item.type === 'manual') {
            productDesc = "Adjustment";
        }

        wsData.push([
            idx + 1,
            item.room,
            item.qty,
            (item.type !== 'rod' && item.type !== 'manual') ? item.mount : 'IM',
            item.type !== 'manual' ? item.width : 0,
            (item.type !== 'rod' && item.type !== 'manual') ? item.height : 0,
            productDesc,
            item.pricing.desc,
            "pc",
            item.pricing.rate,
            item.pricing.amount,
            item.special_instructions || ''
        ]);

        if (item.type === 'rod') {
            rodCost += item.pricing.amount;
        } else {
            subtotal += item.pricing.amount;
            if (item.type === 'roman' && item.pricing.isOversized) {
                oversizedCount += item.qty;
            }
            if (item.pricing.extraRodCost) {
                rodCost += item.pricing.extraRodCost;
                subtotal -= item.pricing.extraRodCost;
            }
        }
    });

    let oversizedCost = 0;
    if (oversizedCount > 0) {
        oversizedCost = 50 + (oversizedCount - 1) * 25;
    }

    let summaryRows = [
        ["", "", "", "", "", "", "", "", "Products Subtotal", "", subtotal],
        ["", "", "", "", "", "", "", "", "Oversized Surcharge", "", oversizedCost],
        ["", "", "", "", "", "", "", "", "Hardware & Rods", "", rodCost],
        ["", "", "", "", "", "", "", "", "Shipping fee", "", shipping]
    ];

    if (additionVal > 0) {
        summaryRows.push(["", "", "", "", "", "", "", "", additionDesc, "", additionVal]);
    }
    if (deductionVal > 0) {
        summaryRows.push(["", "", "", "", "", "", "", "", deductionDesc, "", -deductionVal]);
    }

    summaryRows.push(["", "", "", "", "", "", "", "", "TOTAL", "", 0]); // Will overwrite with formula

    const baseIndex = wsData.length + 1; // Row index (1-based) where summaryRows starts (+1 because next row is empty)
    wsData.push([], ...summaryRows);

    let subRow = 0, overRow = 0, rodRow = 0, shipRow = 0, addRow = 0, dedRow = 0, finalTotalRow = 0;
    for (let i = 0; i < summaryRows.length; i++) {
        let label = summaryRows[i][8];
        let excelRow = baseIndex + i + 1;
        if (label === "Products Subtotal") subRow = excelRow;
        else if (label === "Oversized Surcharge") overRow = excelRow;
        else if (label === "Hardware & Rods") rodRow = excelRow;
        else if (label === "Shipping fee") shipRow = excelRow;
        else if (label === additionDesc) addRow = excelRow;
        else if (label === deductionDesc) dedRow = excelRow;
        else if (label === "TOTAL") finalTotalRow = excelRow;
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply formulas
    ws["K" + subRow] = { f: "SUM(K14:K" + (subRow - 2) + ")" };

    let sumParts = ["K" + subRow, "K" + overRow, "K" + rodRow, "K" + shipRow];
    if (addRow > 0) sumParts.push("K" + addRow);
    if (dedRow > 0) sumParts.push("K" + dedRow); // dedRow amount is negative, so sum will subtract it
    ws["K" + finalTotalRow] = { f: sumParts.join("+") };

    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, "Invoice_PO_" + (po || 'Order') + "_Jin.xlsx");
}

// 12. Excel Export - Fabrication Sheet
function exportFabricationExcel() {
    if (currentOrderItems.length === 0) {
        alert('没有定制产品数据，无法导出 Fabrication！');
        return;
    }

    const po = document.getElementById('meta-po').value || '';
    const customer = document.getElementById('meta-customer').value || '';
    const sidemark = document.getElementById('meta-sidemark').value || '';

    const wb = XLSX.utils.book_new();

    let wsData = [
        ["Jin Park CWF 车间定制工艺加工单", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["PO Number:", po, "", "Customer:", customer, "", "", "Sidemark:", sidemark, "", "", "Date:", new Date().toLocaleDateString('zh-CN')],
        [],
        ["NO", "房间位置", "数量", "安装方式", "成品宽(吋)", "成品高(吋)", "成品宽(cm)", "成品高(cm)", "裁剪宽(cm)", "裁剪高(cm)", "档数", "画线分段", "拉线根数/边线", "走珠/挂钩数", "布料用量(m)", "面料代码", "款式挂法", "内衬说明", "辅料花边", "特殊加工说明"]
    ];

    let rowNum = 1;
    currentOrderItems.forEach((item) => {
        if (item.type === 'manual') return;

        let fab = item.fabrication || {};
        let w_cm = fab.w_cm || 0;
        let h_cm = item.type !== 'rod' ? (fab.h_cm || 0) : 0;
        let cut_w = fab.cut_w || 0;
        let cut_h = fab.cut_h || 0;

        let folds = '-';
        let marksStr = '-';
        let cordStr = '-';
        let hooksVal = '-';
        let fabricVal = '-';
        let styleLabel = '';
        let liningLabel = '';

        if (item.type === 'roman') {
            folds = fab.folds;
            marksStr = fab.marksStr;
            cordStr = fab.cordStr;
            styleLabel = "罗马帘: " + item.shade_style + " / " + item.lift_control;
            liningLabel = item.lining;
        } else if (item.type === 'drapery') {
            hooksVal = fab.hooks;
            if (item.panel_type === 'pair') {
                hooksVal = fab.hooks + " / panel (共" + (fab.hooks * 2) + ")";
            }
            fabricVal = fab.fabric;
            styleLabel = item.header_style + " (" + fab.fullness + "倍) - " + item.panel_type;
            liningLabel = item.lining;
        } else if (item.type === 'rod') {
            styleLabel = '滑挂式轨道杆';
            liningLabel = '无';
        }

        wsData.push([
            rowNum++,
            item.room,
            item.qty,
            item.type !== 'rod' ? item.mount : 'IM',
            item.width,
            item.type !== 'rod' ? item.height : 0,
            w_cm,
            h_cm,
            cut_w,
            cut_h,
            folds,
            marksStr,
            cordStr,
            hooksVal,
            fabricVal,
            item.fabric_code || '无',
            styleLabel,
            liningLabel,
            item.trim || '无',
            item.special_instructions
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "加工单");
    XLSX.writeFile(wb, "Fabrication_PO_" + (po || 'Order') + "_Jin.xlsx");
}

Number.prototype.round = function(places) {
    return +(Math.round(this + "e+" + places)  + "e-" + places);
};
