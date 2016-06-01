require('./number-range-picker.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { $, Dataset, ply } from 'plywood';

import { Essence, Dimension } from '../../../common/models/index';
import { toSignificantDigits, getNumberOfWholeDigits, digitsToHumanFriendly } from '../../../common/utils/general/general';


import { getXFromEvent, clamp } from '../../utils/dom/dom';
import { minToAny, maxToAny, isStartAny, isBeyondMin, isEndAny, isBeyondMax } from '../../utils/number-range/number-range';

import { Loader } from '../loader/loader';
import { QueryError } from '../query-error/query-error';
import { RangeHandle } from '../range-handle/range-handle';

export const NUB_SIZE = 16;
// this is how many steps we want to represent in the slider bar
export const GRANULARITY_IN_BAR = 300;

function getAdjustedStart(start: number) {
  return start + NUB_SIZE;
}

function getAdjustedEnd(end: number) {
  return end && end > NUB_SIZE ? end - NUB_SIZE : 0;
}

function getNumberOfDigitsToShow(n: number) {
  var totalDigits = getNumberOfWholeDigits(n / GRANULARITY_IN_BAR);
  return totalDigits > 3 ? Math.min(totalDigits, 4) : 3;
}

// offset the bar a little because a rectangle at the same position as a circle will peek through
function getAdjustedStartHalf(start: number) {
  return start + NUB_SIZE / 2;
}

export interface NumberRangePickerProps extends React.Props<any> {
  start: number;
  end: number;
  essence: Essence;
  dimension: Dimension;
  onRangeStartChange: (n: number) => void;
  onRangeEndChange: (n: number) => void;
}

export interface NumberRangePickerState {
  leftOffset?: number;
  rightBound?: number;
  min?: number;
  max?: number;
  step?: number;
  loading?: boolean;
  error?: any;
}

export class NumberRangePicker extends React.Component<NumberRangePickerProps, NumberRangePickerState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      min: null,
      max: null,
      step: null,
      loading: false,
      error: null
    };
  }

  fetchData(essence: Essence, dimension: Dimension, rightBound: number): void {
    var { dataSource } = essence;
    var filterExpression = essence.getEffectiveFilter(null, dimension).toExpression();
    var $main = $('main');
    var query = ply()
      .apply('main', $main.filter(filterExpression))
      .apply('Min', $main.min($(dimension.name)))
      .apply('Max', $main.max($(dimension.name)));

    this.setState({
      loading: true
    });

    dataSource.executor(query)
      .then(
        (dataset: Dataset) => {
          if (!this.mounted) return;
          var min = (dataset.data[0]['Min'] as number);
          var max = (dataset.data[0]['Max'] as number);

          var step = max && min && isFinite(max) && isFinite(min) ? (max - min) / rightBound : 1;

          this.setState({
            min,
            max,
            loading: false,
            step: step !== 0 && isFinite(step) ? step : 1
          });
        },
        (error) => {
          if (!this.mounted) return;
          this.setState({
            loading: false,
            error
          });
        }
      );
  }

  componentDidMount() {
    this.mounted = true;
    var node = ReactDOM.findDOMNode(this.refs['number-range-picker']);
    var rect =  node.getBoundingClientRect();
    var { essence, dimension } = this.props;
    var leftOffset = rect.left;
    var rightBound = rect.width;

    this.setState({ leftOffset, rightBound });
    this.fetchData(essence, dimension, rightBound);

  }

  componentWillUnmount() {
    this.mounted = false;
  }

  relativePositionToValue(position: number) {
    const { step, min, max, rightBound } = this.state;
    if (position === 0) return minToAny();
    if (position === rightBound) return maxToAny();

    var range = max - min !== 0 ? max - min : Math.abs(max);
    return toSignificantDigits(position * step, getNumberOfDigitsToShow(range));
  }

  valueToRelativePosition(value: number) {
    const { step } = this.state;
    return value / step;
  }

  onBarClick(positionStart: number, positionEnd: number, e: MouseEvent) {
    const { leftOffset } = this.state;

    var clickPadding = 5;
    var absoluteX = getXFromEvent(e);
    var relativeX = absoluteX - leftOffset;
    if (relativeX < NUB_SIZE / 2) return this.updateStart(leftOffset);


    var startNubPosition = getAdjustedStart(positionStart) + clickPadding;
    var endNubPosition = getAdjustedEnd(positionEnd) + clickPadding;

    var isBeforeStart = relativeX < positionStart;
    var isAfterEnd = relativeX > positionEnd + NUB_SIZE;
    var inBetween = (relativeX < positionEnd) && relativeX > startNubPosition;

    if (isBeforeStart) {
      this.updateStart(absoluteX);
    } else if (isAfterEnd) {
      this.updateEnd(absoluteX);
    } else if (inBetween) {

      var distanceFromEnd = endNubPosition - relativeX;
      var distanceFromStart = relativeX - startNubPosition;

      if (distanceFromEnd < distanceFromStart) {
        this.updateEnd(endNubPosition + leftOffset - distanceFromEnd);
      } else {
        this.updateStart(startNubPosition + leftOffset + distanceFromStart);
      }
      return;
    }
  }

  updateStart(absolutePosition: number) {
    const { onRangeStartChange } = this.props;
    const { leftOffset } = this.state;

    var relativePosition = absolutePosition - leftOffset;
    var newValue = this.relativePositionToValue(relativePosition);
    onRangeStartChange(newValue);
  }

  updateEnd(absolutePosition: number) {
    const { onRangeEndChange } = this.props;
    const { leftOffset } = this.state;

    var relativePosition = absolutePosition - leftOffset;
    var newValue = this.relativePositionToValue(relativePosition);

    onRangeEndChange(newValue);
  }

  render() {
    const { start, end } = this.props;
    const { min, max, loading, error, step, rightBound, leftOffset } = this.state;

    var content: JSX.Element = null;

    if (rightBound && step && isFinite(max) && isFinite(min)) {
      var relativeEnd = isEndAny(end) ? rightBound : this.valueToRelativePosition(end);
      var relativeStart = this.valueToRelativePosition(start);
      var adjustedRightBound = getAdjustedEnd(rightBound);

      var positionEnd = clamp(relativeEnd, getAdjustedStart(relativeStart), adjustedRightBound);

      var positionStart = start ? clamp(relativeStart, 0, getAdjustedEnd(positionEnd)) : 0;

      var rangeBarLeft = { left: 0, width: positionStart };
      var rangeBarMiddle = { left: getAdjustedStartHalf(positionStart), width: positionEnd - positionStart };
      var rangeBarRight = { left: getAdjustedStartHalf(positionEnd), width: getAdjustedEnd(rightBound) - positionEnd };

      var absoluteRightBound = leftOffset + rightBound;

      content = <div className="range-slider" onMouseDown={this.onBarClick.bind(this, positionStart, positionEnd)}>
        <div className="range-bar left" style={rangeBarLeft} />
        <RangeHandle
          positionLeft={positionStart}
          onChange={this.updateStart.bind(this)}
          isAny={isStartAny(start)}
          isBeyondMin={isBeyondMin(min, start)}
          leftBound={leftOffset}
          rightBound={leftOffset + getAdjustedEnd(positionEnd)}
          offset={leftOffset}
        />
        <div className="range-bar middle" style={rangeBarMiddle} />
        <RangeHandle
          positionLeft={positionEnd}
          onChange={this.updateEnd.bind(this)}
          isAny={isEndAny(end)}
          isBeyondMax={isBeyondMax(max, end)}
          leftBound={leftOffset + getAdjustedStart(positionStart)}
          rightBound={absoluteRightBound}
          offset={leftOffset}
        />
        <div className="range-bar right" style={rangeBarRight} />
      </div>;
    }

    return <div className="number-range-picker" ref="number-range-picker">
      {content}
      {loading ? <Loader/> : null}
      {error ? <QueryError error={error}/> : null}
    </div>;
  }
}
