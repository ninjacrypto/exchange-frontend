import React, { Component, Fragment } from 'react';
import { Columns, Element } from 'react-bulma-components';
import PropTypes from 'prop-types';
import _ from 'lodash';
import matchSorter from 'match-sorter';
import { DocumentPdf, DocumentExcel, DocumentCsv } from 'grommet-icons';
import pdfmake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import xlsx from 'xlsx';
import { FormSearch } from 'grommet-icons';
import cx from 'classnames';
import { withNamespaces } from 'react-i18next';

import { ReactTable, Pagination } from 'containers/Tables';
import { nestedTranslate } from 'utils/strings';
import { Menu, Box } from 'components/Wrapped';
import { StyledTextInput } from 'components/Form/TextField';
import { ConditionalWrapper } from 'components/Helpers';
import { Tooltip } from 'components/Tooltip';

class TableWrapper extends Component {
  state = {
    filtered: [],
    filterAll: '',
  };

  static propTypes = {
    fileName: PropTypes.string,
  };

  static defaultProps = {
    fileName: 'data.csv',
  };

  reactTable = React.createRef();

  renderHiddenColumns() {
    const { columns, hideColumns } = this.props;

    return columns.filter(
      column => !hideColumns.includes(column.id ? column.id : column.accessor),
    );
  }

  renderFilterableColumns() {
    let { columns } = this.props;
    const { filterBy, hideColumns } = this.props;

    if (hideColumns) {
      columns = this.renderHiddenColumns();
    }

    return [
      ...columns,
      {
        Header: 'All',
        id: 'all',
        width: 0,
        resizable: false,
        sortable: false,
        Filter: () => {},
        filterMethod: (filter, rows) => {
          const result = matchSorter(rows, filter.value, {
            keys: filterBy,
            threshold: matchSorter.rankings.WORD_STARTS_WITH,
          });
          return result;
        },
        filterAll: true,
      },
    ];
  }

  renderFilterableHiddenColumns() {
    const { filterBy } = this.props;

    return [
      ...this.renderHiddenColumns(),
      {
        Header: 'All',
        id: 'all',
        width: 0,
        resizable: false,
        sortable: false,
        Filter: () => {},
        getProps: () => {
          return {
            style: { padding: '0px', textIndent: '-999999px' },
          };
        },
        filterMethod: (filter, rows) => {
          const result = matchSorter(rows, filter.value, {
            keys: filterBy,
            threshold: matchSorter.rankings.WORD_STARTS_WITH,
          });
          return result;
        },
        filterAll: true,
      },
    ];
  }

  renderColumns() {
    const { columns, hideColumns, isFilterable } = this.props;

    if (isFilterable) {
      return this.renderFilterableColumns();
    } else if (!_.isEmpty(hideColumns) && !isFilterable) {
      return this.renderHiddenColumns();
    } else {
      return columns;
    }
  }

  onFilteredChange = filtered => {
    const { filterAll } = this.state;

    if (!_.isEmpty(filtered) && !_.isEmpty(filterAll)) {
      const filterAll = '';
      this.setState({
        filtered: filtered.filter(item => item.id !== 'all'),
        filterAll,
      });
    } else {
      this.setState({ filtered });
    }
  };

  filterAll = e => {
    const { value } = e.target;
    const filterAll = value;
    const filtered = [{ id: 'all', value: filterAll }];

    // NOTE: this completely clears any COLUMN filters
    this.setState({ filterAll, filtered });
  };

  render() {
    const { isFilterable, exportable, t: translate, fileName, data } = this.props;
    const { filtered, filterAll } = this.state;
    const t = nestedTranslate(translate, 'forms.common');

    return (
      <Fragment>
        <Columns marginless={true} multiline={false} className="is-mobile">
          <Columns.Column paddingless={true}>
            {isFilterable && (
              <Box
                pad={{ vertical: 'xsmall' }}
                round={false}
                fill={true}
                justify="end"
              >
                <StyledTextInput
                  value={filterAll}
                  onChange={this.filterAll}
                  placeholder={t('search')}
                  size="xsmall"
                  focusIndicator={false}
                  background="background-2"
                  addonEnd={{
                    content: <FormSearch size="16px" />,
                    background: 'background-2',
                  }}
                />
              </Box>
            )}
          </Columns.Column>
          {exportable && (
            <Columns.Column paddingless={true}>
              <Element pull="right">
                <ReactTableExport
                  data={data}
                  reactTable={this.reactTable}
                  exportable={exportable}
                  fileName={fileName}
                />
              </Element>
            </Columns.Column>
          )}
        </Columns>
        <ReactTable
          {...this.props}
          columns={this.renderColumns()}
          isFilterable={isFilterable}
          filtered={filtered}
          ref={this.reactTable}
          onFilteredChange={this.onFilteredChange}
          className={cx(
            { 'is-filterable': isFilterable },
            this.props.className,
          )}
          PaginationComponent={Pagination}
        />
      </Fragment>
    );
  }
}

// We need this component to properly download data from the React Table
class ReactTableExportWrapper extends Component {

  state = {
    data: '',
  };
  csv = React.createRef();


  getFileName() {
    const { fileName = 'data' } = this.props;

    return fileName;
  }

  setData(cb) {
    const {
      sortedData,
      exportable,
      columns,
    } = this.props.reactTable.current.getResolvedState();
    const pickedData = sortedData.map(singleData =>
      _.pick(singleData, exportable),
    );

    let data = [];

    pickedData.forEach(singleData => {
      if (!data.length) {
        const headers = Object.keys(singleData).map(singleHeader => {
          let column = _.find(columns, { accessor: singleHeader });

          if (!column) {
            column = _.find(columns, { id: singleHeader });
          }

          return column.Header ? column.Header : singleHeader;
        });

        data.push(headers);
      }

      const values = Object.values(singleData).map(singleValue =>
        !_.isUndefined(singleValue) ? singleValue : '',
      );

      data.push(values);
    });

    this.setState({ data }, () => cb());
  }

  downloadPdf = () => {
    this.setData(() => {
      const widths = this.state.data[0].map(() =>
        parseInt(725 / this.state.data[0].length),
      );
      // console.log(widths);
      pdfmake.vfs = pdfFonts.pdfMake.vfs;
      pdfmake
        .createPdf({
          pageOrientation: 'landscape',
          content: [
            {
              table: {
                headerRows: 1,
                widths,
                body: this.state.data,
              },
            },
          ],
        })
        .download(`${this.getFileName()}.pdf`);
    });
  };

  downloadExcel = fileType => () => {
    this.setData(() => {
      const wb = xlsx.utils.book_new();
      const sheet = xlsx.utils.aoa_to_sheet(this.state.data);
      xlsx.utils.book_append_sheet(wb, sheet);

      xlsx.writeFile(wb, `${this.getFileName()}.${fileType}`, {
        bookType: fileType,
      });
    });
  };

  render() {
    const { t, data } = this.props;
    // const isDisabled = this.state.data.length < 1;
    let isDisabled = true;
    if (data !== null && data !== undefined && data.length !== 0) {
      isDisabled = false;
    } else {
      isDisabled = true;
    }

    return (
      <Fragment>
        <ConditionalWrapper enableWrapper={isDisabled} wrapper={
          <Tooltip description={t('tables.toolTips.exportDisabled')} />
        }>
          <Menu
            disabled={isDisabled}
            label={t('buttons.exportData')}
            items={[
              {
                label: 'CSV',
                onClick: this.downloadExcel('csv'),
                icon: <DocumentCsv />,
              },
              { label: 'PDF', onClick: this.downloadPdf, icon: <DocumentPdf /> },
              {
                label: 'Excel',
                onClick: this.downloadExcel('xlsx'),
                icon: <DocumentExcel />,
              },
            ]}
          />
        </ConditionalWrapper>
      </Fragment>
    );
  }
}

export const ReactTableExport = withNamespaces()(ReactTableExportWrapper);

export default withNamespaces()(TableWrapper);
