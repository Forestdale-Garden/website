const BASE_ID = 'appZTtJYDTReNmId7';
const TABLE_ID = 'tbl2N2ypIa8mg12TQ';

exports.handler = async function (event) {
  const API_KEY = process.env.AIRTABLE_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const params = new URLSearchParams({
    filterByFormula: "{Donor}!=''",
  });

  const fields = [
    'Common Name', 'Latin Name', 'Type', 'Photo',
    'Notes', 'Information', 'Native?', 'Annual?', 'Donor',
  ];
  fields.forEach(f => params.append('fields[]', f));

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?${params}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!response.ok) {
      const text = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: text }) };
    }

    const data = await response.json();

    const records = data.records.map(record => ({
      id: record.id,
      ...record.fields,
    }));

    // Sort alphabetically by common name
    records.sort((a, b) => (a['Common Name'] || '').localeCompare(b['Common Name'] || ''));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify(records),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
