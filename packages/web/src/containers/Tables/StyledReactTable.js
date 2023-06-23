import React from 'react';
import InitialReactTable from 'react-table';
import styled from 'styled-components';
import { colorStyle } from 'grommet-styles';

const StyledReactTable = styled(InitialReactTable)`
  &.ReactTable {
    flex: 1 1 auto;
    overflow: auto;
    border: none;

    &.is-filterable {
      .rt-tr {
        .rt-th {
          &:nth-last-child(2) {
            .rt-resizer {
              display: none;
            }
          }

          &:last-of-type {
            display: none;
          }
        }

        .rt-td:last-of-type {
          display: none;
        }
      }
    }

    &.hide-border .rt-table .rt-tbody .rt-tr-group {
      border-bottom: 0;

      &:last-child {
        border-bottom: 0;
      }
    }

    .rt-table {
      flex: 0 1 auto;

      ${props =>
        props.background &&
        colorStyle('background-color', props.background, props.theme)}
      border-radius: 3px;

      .rt-thead {
        box-shadow: none;

        .rt-tr {
          text-align: left;
        }
      }

      .rt-thead {
        width: auto !important;
        &.table-thead {
          padding: 10px 5px;
          border-bottom: 1px solid var(--border-3);
        }

        .rt-th {
          white-space: pre-line !important;
          ${props =>
            props.headBackground &&
            colorStyle('background-color', props.headBackground, props.theme)}
          border: 0;
          padding: 12px 6px;
          font-size: 12px;
          font-weight: 600;
          line-height: 18px;

          &.table-th {
            font-weight: normal;

            &.-sort-desc {
              box-shadow: none;
            }

            &.-sort-asc {
              box-shadow: none;
            }
          }

          &:not(.table-th) {
            &.-sort-desc {
              box-shadow: inset 0 -2px 0 0 var(--primary);
            }

            &.-sort-asc {
              box-shadow: inset 0 2px 0 0 var(--primary);
            }
          }
        }
      }

      .rt-tbody {
        .rt-tr-group {
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);

          &:last-child {
            border-bottom: 0;
          }
        }

        .rt-td {
          border-right: 0;
          padding: 6px;
          white-space: pre-line !important;
          overflow: visible;
        }
      }
    }

    .rt-expander:after {
      border-top-color: var(--primary);
    }

    .Table__itemCount {
      margin-top: 10px;
      font-size: 14px;
    }

    .Table__pagination {
      display: flex;
      justify-content: left;
      padding: 10px 10px;
      ${props =>
        props.paginationBackground &&
        colorStyle('background-color', props.paginationBackground, props.theme)}
    }

    .Table__pageButton {
      font-size: 15px;
      outline: none;
      border: none;
      background-color: transparent;
      ${props => colorStyle('color', 'text', props.theme)}
      cursor: pointer;
    }

    .Table__pageButton:disabled {
      cursor: not-allowed;
      opacity: .5;
    }

    .Table__pageButton--active {
      color: var(--primary);
      font-weight: bold;
    }
  }
`;

export const ReactTable = React.forwardRef(
  (
    {
      background = 'tableBackground',
      headBackground = 'tableHeadBackground',
      paginationBackground = 'tableHeadBackground',
      ...rest
    },
    ref,
  ) => {
    return (
      <StyledReactTable
        background={background}
        headBackground={headBackground}
        paginationBackground={paginationBackground}
        {...rest}
        ref={ref}
      />
    );
  },
);
