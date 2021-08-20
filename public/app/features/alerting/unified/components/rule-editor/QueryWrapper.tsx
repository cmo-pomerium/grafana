import React, { FC, ReactNode, useState } from 'react';
import { css } from '@emotion/css';
import { cloneDeep } from 'lodash';
import {
  DataQuery,
  DataSourceInstanceSettings,
  GrafanaTheme2,
  PanelData,
  RelativeTimeRange,
  getDefaultRelativeTimeRange,
} from '@grafana/data';
import { useStyles2, RelativeTimeRangePicker } from '@grafana/ui';
import { QueryEditorRow } from 'app/features/query/components/QueryEditorRow';
import { VizWrapper } from './VizWrapper';
import { isExpressionQuery } from 'app/features/expressions/guards';
import { TABLE, TIMESERIES } from '../../utils/constants';
import { AlertQuery } from 'app/types/unified-alerting-dto';
import { SupportedPanelPlugins } from '../PanelPluginsButtonGroup';
import { QueryOperationRow } from '../../../../../core/components/QueryOperationRow/QueryOperationRow';

interface Props {
  data: PanelData;
  query: AlertQuery;
  queries: AlertQuery[];
  dsSettings: DataSourceInstanceSettings;
  onChangeDataSource: (settings: DataSourceInstanceSettings, index: number) => void;
  onChangeQuery: (query: DataQuery, index: number) => void;
  onChangeTimeRange?: (timeRange: RelativeTimeRange, index: number) => void;
  onRemoveQuery: (query: DataQuery) => void;
  onDuplicateQuery: (query: AlertQuery) => void;
  onRunQueries: () => void;
  index: number;
}

export const QueryWrapper: FC<Props> = ({
  data,
  dsSettings,
  index,
  onChangeDataSource,
  onChangeQuery,
  onChangeTimeRange,
  onRunQueries,
  onRemoveQuery,
  onDuplicateQuery,
  query,
  queries,
}) => {
  const styles = useStyles2(getStyles);
  const isExpression = isExpressionQuery(query.model);
  const [pluginId, changePluginId] = useState<SupportedPanelPlugins>(isExpression ? TABLE : TIMESERIES);
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);

  const renderTimePicker = (query: AlertQuery, index: number): ReactNode => {
    if (!onChangeTimeRange) {
      return null;
    }

    return (
      <RelativeTimeRangePicker
        timeRange={query.relativeTimeRange ?? getDefaultRelativeTimeRange()}
        onChange={(range) => onChangeTimeRange(range, index)}
      />
    );
  };

  const renderQueryOptions = () => {
    return (
      <QueryOperationRow
        index={0}
        id="query-options"
        title="Query options"
        headerElement={() => <div>Options....</div>}
        isOpen={optionsOpen}
        onOpen={() => setOptionsOpen(true)}
        onClose={() => setOptionsOpen(false)}
      >
        options
      </QueryOperationRow>
    );
  };

  const renderHeaderExtras = () => {
    if (isExpressionQuery(query.model)) {
      return null;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {renderTimePicker(query, index)}
        {renderQueryOptions()}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <QueryEditorRow<DataQuery>
        dataSource={dsSettings}
        onChangeDataSource={!isExpression ? (settings) => onChangeDataSource(settings, index) : undefined}
        id={query.refId}
        index={index}
        key={query.refId}
        data={data}
        query={cloneDeep(query.model)}
        onChange={(query) => onChangeQuery(query, index)}
        onRemoveQuery={onRemoveQuery}
        onAddQuery={onDuplicateQuery}
        onRunQuery={onRunQueries}
        queries={queries}
        renderHeaderExtras={renderHeaderExtras}
        visualization={data ? <VizWrapper data={data} changePanel={changePluginId} currentPanel={pluginId} /> : null}
        hideDisableQuery={true}
      />
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css`
    label: AlertingQueryWrapper;
    margin-bottom: ${theme.spacing(1)};
    border: 1px solid ${theme.colors.border.medium};
    border-radius: ${theme.shape.borderRadius(1)};
    padding-bottom: ${theme.spacing(1)};
  `,
});
