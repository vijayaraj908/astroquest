export const FACILITY_DATA = [
  {
    id: 'LCC',
    name: 'LUNAR COMMAND CENTER',
    x: 145,
    y: 120,
    color: 0x56c7ff,
    purpose: 'Central operational command post. Houses environmental telemetry, structural monitoring, communication systems and crew sleeping quarters.',
    resources: 'Central monitoring and command facility.',
    task: 'Review base telemetry and initiate the daily sleep protocol.',
    operation: null
  },

  {
    id: 'SOLAR',
    name: 'SOLAR ARRAY & GRID HUB',
    x: 175,
    y: 380,
    color: 0xffd166,
    purpose: 'Generates the lunar outpost electrical supply through photovoltaic solar arrays.',
    resources: '+30 kW electricity generation.',
    task: 'Calibrate solar panel azimuth and synchronize the power grid.',
    operation: {
      electricity: 30
    }
  },

  {
    id: 'WRS',
    name: 'WATER RECOVERY SYSTEM',
    x: 320,
    y: 120,
    color: 0x4fc3f7,
    purpose: 'Recovers humidity condensate, greywater and physiological waste to produce potable water.',
    resources: '-2 kW power | +10 L water.',
    task: 'Operate pressure valves and stabilize centrifuge RPM.',
    operation: {
      electricity: -2,
      water: 10
    }
  },

  {
    id: 'OGA',
    name: 'OXYGEN GENERATION ASSEMBLY',
    x: 500,
    y: 100,
    color: 0x66e0cc,
    purpose: 'Generates breathable oxygen using an electrolysis system.',
    resources: '-3 kW power | +12 oxygen units.',
    task: 'Stabilize electrolysis waveforms and operate gas release valves.',
    operation: {
      electricity: -3,
      oxygen: 12
    }
  },

  {
    id: 'LAB',
    name: 'SCIENCE LAB & CHEMICAL SYNTHESIZER',
    x: 670,
    y: 260,
    color: 0xc5a3ff,
    purpose: 'Combines water and oxygen through catalytic synthesis to manufacture high-density fuel cells.',
    resources: '-2 kW | -2 L water | -2 oxygen | +1 fuel cell.',
    task: 'Measure reactants and activate the synthesis chamber.',
    operation: {
      electricity: -2,
      water: -2,
      oxygen: -2,
      fuelCells: 1
    }
  },

  {
    id: 'CREW',
    name: 'CREW QUARTERS & MEDICAL REFUGE',
    x: 150,
    y: 220,
    color: 0xff9b86,
    purpose: 'Provides crew accommodation, medical facilities and essential life-support services.',
    resources: '-10 kW | -8 L water | -6 oxygen units.',
    task: 'Route life-support supplies and clear medical alerts.',
    operation: {
      electricity: -10,
      water: -8,
      oxygen: -6
    }
  },

  {
    id: 'BLSM',
    name: 'BIO-REGENERATIVE LIFE SUPPORT',
    x: 330,
    y: 520,
    color: 0x80e09c,
    purpose: 'Maintains aeroponic crops and algae photobioreactors for biological life support.',
    resources: '-8 kW | -6 L water | -2 oxygen units.',
    task: 'Balance nutrient conductivity and atmospheric CO2 scrubbing.',
    operation: {
      electricity: -8,
      water: -6,
      oxygen: -2
    }
  },

  {
    id: 'EVA',
    name: 'EVA ERP STATION',
    x: 680,
    y: 520,
    color: 0xffc078,
    purpose: 'Prepares astronaut suits, portable oxygen supplies and equipment for lunar surface expeditions.',
    resources: '-4 kW | -2 L water | -4 oxygen units.',
    task: 'Prepare suit coolant, batteries and oxygen tanks.',
    operation: {
      electricity: -4,
      water: -2,
      oxygen: -4
    }
  }
];