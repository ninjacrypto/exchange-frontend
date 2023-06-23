import * as React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from 'recharts';

import { PageWrap } from 'components/Containers';

import { moment } from 'i18n';
import { authenticatedInstance } from 'api';
import { Box, Button, Paragraph, Heading } from 'components/Wrapped';
import { Formik, Form } from 'formik';
import { Select, FormField } from 'components/Form';
import { Columns } from 'react-bulma-components';

const BINARY = 'binary';
const PRICE = 'price';

class CryptoPrediction extends React.Component {
  state = {
    type: PRICE,
    chartData: [],
  };

  getChartData = async ({ trainingDays, predictionDays, type }) => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/get-prediction-data',
        method: 'POST',
        data: {
          trainingDays,
          predictionDays,
          type,
        },
      });

      if (data.status === 'Success') {
        this.setState({ chartData: data.data.chartData });
      }
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    return (
      <PageWrap>
        <Columns>
          <Columns.Column
            tablet={{
              size: 12,
            }}
            desktop={{
              size: 4,
            }}
          >
            <Box background="background-2">
              <Heading level={3} textAlign="center">
                Prediction Parameters
              </Heading>
              <Formik
                initialValues={{
                  trainingDays: '30',
                  predictionDays: '3',
                  type: PRICE,
                }}
                onSubmit={this.getChartData}
              >
                {() => (
                  <Form>
                    <FormField
                      name="trainingDays"
                      label="Training Days"
                      help="Days of previous prices to train off of."
                    >
                      <Select
                        name="trainingDays"
                        options={['30', '40', '50', '60', '70']}
                      />
                    </FormField>
                    <FormField
                      name="predictionDays"
                      label="Prediction Days"
                      help="Days into the future to predict prices for."
                    >
                      <Select
                        name="predictionDays"
                        options={['1', '2', '3', '4', '5', '6', '7']}
                      />
                    </FormField>
                    <FormField
                      name="type"
                      label="Prediction Type"
                      help={`"Price" will give predictions in prices. "Binary" will give predictions as "up" or "down" price movement.`}
                    >
                      <Select
                        name="type"
                        options={[
                          { value: BINARY, label: _.startCase(BINARY) },
                          { value: PRICE, label: _.startCase(PRICE) },
                        ]}
                        labelKey="label"
                        valueKey="value"
                      />
                    </FormField>
                    <Button type="submit" fill="horizontal">
                      Submit
                    </Button>
                  </Form>
                )}
              </Formik>
            </Box>
          </Columns.Column>
          <Columns.Column
            tablet={{
              size: 12,
            }}
            desktop={{
              size: 8,
            }}
          >
            <Box background="background-2" fill={true}>
              <Heading level={3} textAlign="center">
                Prediction Chart
              </Heading>
              <ResponsiveContainer>
                <LineChart
                  data={this.state.chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="date"
                    type="number"
                    tickFormatter={timeStr =>
                      moment
                        .utc(timeStr)
                        .local()
                        .format('l')
                    }
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis />
                  <Tooltip content={PricePredictionChartToolTip} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predictedPrice"
                    dot={false}
                    stroke="#3584d8"
                    name="Predicted Price"
                  />
                  <Line
                    type="monotone"
                    dataKey="historicalPrice"
                    dot={false}
                    stroke="#82ca9d"
                    name="Historical Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Columns.Column>
        </Columns>
      </PageWrap>
    );
  }
}

const PricePredictionChartToolTip = ({ payload }) => {
  if (!payload || !payload.length) {
    return null;
  }

  const title = moment(payload[0].payload.date).format('l');

  return (
    <Box background="light-1">
      <Paragraph>{title}</Paragraph>
      {payload.map((singlePrediction, i) => (
        <Paragraph color={singlePrediction.color} key={i}>
          <strong>{singlePrediction.name}: </strong>
          {singlePrediction.value}
        </Paragraph>
      ))}
    </Box>
  );
};

export default withRouter(connect()(CryptoPrediction));
