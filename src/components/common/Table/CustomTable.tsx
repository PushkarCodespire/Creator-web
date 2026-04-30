// ===========================================
// CUSTOM TABLE COMPONENT
// Standardized table with CodeSpire styling
// ===========================================

import React from 'react';
import { Table, TableProps } from 'antd';
import { colors, shadows } from '../../../styles/tokens';

const CustomTable = <T extends object>(props: TableProps<T>) => {
    return (
        <div className="custom-table-container">
            <Table
                {...props}
                className={`custom-table ${props.className || ''}`}
                pagination={props.pagination !== false ? {
                    ...props.pagination,
                    className: 'custom-pagination',
                } : false}
            />
            <style>{`
        .custom-table .ant-table {
          background: #ffffff !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          border: 1px solid ${colors.gray[200]} !important;
          box-shadow: ${shadows.md} !important;
        }
        .custom-table .ant-table-thead > tr > th {
          background: ${colors.gray[50]} !important;
          color: ${colors.gray[600]} !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 2px solid ${colors.gray[200]} !important;
          padding: 16px 24px !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid ${colors.gray[100]} !important;
          color: ${colors.text.secondary} !important;
          font-size: 14px !important;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background: ${colors.gray[50]} !important;
        }
        .custom-pagination {
          margin: 16px 0 !important;
        }
        .custom-pagination .ant-pagination-item-active {
          border-color: ${colors.primary.solid} !important;
          background: ${colors.primary.solid} !important;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: #ffffff !important;
        }
      `}</style>
        </div>
    );
};

export default CustomTable;
