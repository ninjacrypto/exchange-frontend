import React, { useEffect, useState, useRef } from 'react';
import { withNamespaces } from 'react-i18next';
import _ from 'lodash';
import instance, { authenticatedInstance } from 'api';
import { ReactTable, Pagination } from 'containers/Tables';
import { ReactTableExport } from 'containers/Tables/TableWrapper';
import { Box, Select } from 'components/Wrapped';
import { Tooltip } from 'components/Tooltip';
import { TabletUp, Mobile } from 'components/Responsive';

const instanceTypes = {
  authenticated: authenticatedInstance,
  instance,
};

const PaginationTableWrapper2 = ({
  apiUrl,
  apiData,
  staticData,
  columns,
  exportable,
  fileName,
  instanceType = 'authenticated',
  shouldFetchData,
  refetchInterval,
  dataTransformer,
  t,
  filters,
  ...rest
}) => {
  const [data, setData] = useState(staticData ? staticData : []);
  const [numPages, setNumPages] = useState(-1);
  const [pageSize, setPageSize] = useState('20');
  const reactTableRef = useRef(null);
  let handleFetchData;
  let isTradePage = window.location.pathname.startsWith('/trade');

  useEffect(() => {
    if (shouldFetchData) {
      reactTableRef.current.fireFetchData();
    }
  }, [shouldFetchData, apiData]);

  useEffect(() => {
    let interval;
    if (shouldFetchData && refetchInterval) {
      interval = setInterval(() => {
        reactTableRef.current.fireFetchData();
      }, refetchInterval);
    }

    return function cleanup() {
      if (shouldFetchData && refetchInterval) {
        clearInterval(interval);
      }
    };
  }, [shouldFetchData, refetchInterval]);

  if (apiUrl && shouldFetchData) {
    handleFetchData = async (state, instance) => {
      if (shouldFetchData) {
        try {
          const response = await instanceTypes[instanceType]({
            url: apiUrl,
            method: 'GET',
            data: {
              ...apiData,
              page: state.page + 1,
              count: state.pageSize,
            },
            polling: refetchInterval ? true : false,
          });

          if (response.data.status === 'Success') {
            const {
              pagination: { items_per_page, total_items },
              page_data,
            } = response.data.data;

            if (!_.isEmpty(page_data)) {
                page_data.forEach(element => {
                if (_.has(element, ['serviceCharge'])) {
                  element.serviceCharge = convert(element.serviceCharge);
                }
                if (_.has(element, ['rate'])) {
                  element.rate = convert(element.rate);
                }
                if (_.has(element, ['amount'])) {
                  element.amount = convert(element.amount);
                }
              });
            }
            setData(dataTransformer ? dataTransformer(page_data) : page_data);
            setNumPages(Math.ceil(total_items / items_per_page));
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        setData([]);
      }
    };
  }

  const convert = n => {
    var sign = +n < 0 ? '-' : '',
      toStr = n.toString();
    if (!/e/i.test(toStr)) {
      return n;
    }
    var [lead, decimal, pow] = n
      .toString()
      .replace(/^-/, '')
      .replace(/^([0-9]+)(e.*)/, '$1.$2')
      .split(/e|\./);
    return +pow < 0
      ? sign +
          '0.' +
          '0'.repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) +
          lead +
          decimal
      : sign +
          lead +
          (+pow >= decimal.length
            ? decimal + '0'.repeat(Math.max(+pow - decimal.length || 0, 0))
            : decimal.slice(0, +pow) + '.' + decimal.slice(+pow));
  };

  return (
    <React.Fragment>
      {!staticData && (
        <React.Fragment>
          <Mobile>
            {exportable && (
              <Box pad="none">
                <Tooltip description={t('tables.toolTips.export')}>
                  <ReactTableExport
                    data={data}
                    reactTable={reactTableRef}
                    exportable={exportable}
                    fileName={fileName}
                    columns={columns}
                  />
                </Tooltip>
              </Box>
            )}
          </Mobile>
          <Box pad="none" direction="row" justify="between">
            {!isTradePage && (
              <Box pad="none" direction="row" wrap={true} gap="xsmall">
                <Tooltip description={t('tables.toolTips.pageSize')}>
                  <Select
                    defaultValue={pageSize}
                    options={['10', '20', '50', '100']}
                    onChange={value => setPageSize(value)}
                  />
                </Tooltip>
                {filters}
              </Box>
            )}

            <TabletUp>
              {exportable && (
                <Box pad="none">
                  <Tooltip description={t('tables.toolTips.export')}>
                    <ReactTableExport
                      data={data}
                      reactTable={reactTableRef}
                      exportable={exportable}
                      fileName={fileName}
                      columns={columns}
                    />
                  </Tooltip>
                </Box>
              )}
            </TabletUp>
          </Box>
        </React.Fragment>
      )}
      <ReactTable
        exportable={exportable}
        key={pageSize}
        pageSize={staticData ? staticData.length : parseInt(pageSize)}
        showPagination={staticData ? false : true}
        F
        columns={columns}
        data={data}
        pages={numPages}
        sortable={false}
        manual={staticData ? false : true}
        onFetchData={handleFetchData}
        PaginationComponent={Pagination}
        ref={reactTableRef}
        {...rest}
      />
    </React.Fragment>
  );
};

export default withNamespaces()(PaginationTableWrapper2);
