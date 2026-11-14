// ci5.js - made by make-ci5.js from data/ (CI5-XII). Do not edit by hand.
// Real new cases and person-years, England 2013-2017, men, age groups 0-4 ... 80-84.
const CI5 = {
 "source": "CI5-XII (Bray et al., IARC 2023), England 2013-2017, men",
 "registry": "582600199",
 "cancers": [
  {
   "name": "Lung",
   "code": "21",
   "cases": [
    3,
    1,
    3,
    10,
    21,
    53,
    95,
    203,
    546,
    1455,
    3124,
    5839,
    10242,
    16256,
    18460,
    18732,
    14675
   ]
  },
  {
   "name": "Stomach",
   "code": "11",
   "cases": [
    0,
    0,
    0,
    2,
    15,
    23,
    58,
    115,
    219,
    439,
    731,
    1038,
    1441,
    2241,
    2747,
    3146,
    2976
   ]
  },
  {
   "name": "Colon",
   "code": "13",
   "cases": [
    1,
    7,
    48,
    108,
    148,
    234,
    437,
    552,
    702,
    1248,
    2303,
    3656,
    6082,
    8282,
    9723,
    9504,
    9097
   ]
  }
 ],
 "personYears": [
  8760101,
  8572189,
  7775274,
  8213399,
  9133695,
  9451750,
  9283728,
  8693172,
  8988964,
  9620364,
  9355538,
  8127270,
  7188268,
  7200737,
  5505173,
  4115033,
  2864222
 ]
};
if (typeof module !== "undefined") module.exports = { CI5 };
