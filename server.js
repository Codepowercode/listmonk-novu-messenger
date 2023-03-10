require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Novu } = require('@novu/node');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT;
const app = express();
const novu = new Novu(process.env.NOVU_API_KEY, {
  backendUrl: process.env.NOVU_BACKEND_URL
})

app.use(cors({
  origin: '*'
}))
app.use(express.json());


app.post('/webhook/novu/:templateId', async (req, res) => {
  if (!req.params.templateId) {
    return res.status(400).json({
      error: 'Missing template id'
    })
  }

  console.log(req.body);

  try {
    const recipient = req.body.recipients[0];

    const to = {
      subscriberId: recipient.uuid,
      email: recipient.email,
    }

    const spl = recipient.name.split(' ');
    to.firstName = spl[0];

    if (spl.length > 1) {
      to.lastName = spl[1];
    }

    if (recipient.attribs.phone) {
      to.phone = recipient.attribs.phone
    }

    console.log(1);
    console.log({to});

    try {
      await novu.subscribers.identify(to.subscriberId, {
        ...to,
      })
    } catch (err) {
      console.error(err.message);
    }

    console.log(2);

    const response = await novu.trigger(req.params.templateId, {
      to,
      payload: {}
    })
    console.log(3);
    console.log(response.data);
  } catch(err) {
    console.error(err);

    return res.status(500).json({
      error: 'Internal server error',
    })
  }
  res.sendStatus(200);
})

app.use('*', (req, res) => {
  console.log(req.body);
})



app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
})
