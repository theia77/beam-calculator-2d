export const materials = [
  { id: "steel_a36",      label: "A36 Steel",             e_mpa: 200000, e_kn_m2: 200000000, fy_mpa: 250 },
  { id: "aluminum_6061",  label: "6061 Aluminum",          e_mpa: 69000,  e_kn_m2: 69000000,  fy_mpa: 240 },
  { id: "douglas_fir",    label: "Douglas Fir (Lumber)",   e_mpa: 13000,  e_kn_m2: 13000000,  fy_mpa: 15  },
];

export const sections = [
  { id: "w10x49",      label: "I-Beam: W10x49",      i_mm4: 113210000, i_m4: 0.00011321,    h_mm: 254, ymax_mm: 127, ymax_m: 0.127  },
  { id: "w16x31",      label: "I-Beam: W16x31",      i_mm4: 156000000, i_m4: 0.000156,      h_mm: 406, ymax_mm: 203, ymax_m: 0.203  },
  { id: "rect_50x150", label: "Rect: 50x150 mm",     i_mm4: 14062500,  i_m4: 0.0000140625,  h_mm: 150, ymax_mm: 75,  ymax_m: 0.075  },
  { id: "circ_100",    label: "Pipe: 100 mm OD",     i_mm4: 4908738,   i_m4: 0.000004908738, h_mm: 100, ymax_mm: 50, ymax_m: 0.05   },
];
