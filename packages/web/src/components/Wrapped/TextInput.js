import {
  TextInput as GrommetTextInput,
  MaskedInput as GrommetMaskedInput,
} from 'grommet';
import { edgeStyle } from 'grommet/utils';
import { colorStyle } from 'grommet-styles';
import styled, { css } from 'styled-components';

const TEXT_ALIGN_MAP = {
  center: 'center',
  end: 'right',
  start: 'left',
};

const textAlignStyle = css`
  text-align: ${props => TEXT_ALIGN_MAP[props.textAlign]};
`;

const weightStyle = css`
  font-weight: ${props => props.weight};
`;

export const TextInput = styled(GrommetTextInput)`
${props =>
  props.background &&
  colorStyle('background-color', props.background, props.theme)}
${props =>
  colorStyle('color', props.color ? props.color : 'textStrong', props.theme)}
${props =>
  props.background &&
  colorStyle(
    'border-color',
    props.borderColor ? props.borderColor : props.background,
    props.theme,
  )}
  ${props =>
    props.round &&
    css`
      border-radius: ${props.round};
    `}
    ${props =>
      props.borderRight &&
      css`
      border-right-style: ${props.borderRight};
      `}
  ${props =>
    props.pad &&
    edgeStyle(
      'padding',
      props.pad,
      props.responsive,
      props.theme.box.responsiveBreakpoint,
      props.theme,
    )}
    ${props => props.textAlign && textAlignStyle}
    ${props => props.weight && weightStyle}
`;

export const MaskedInput = styled(GrommetMaskedInput)`
${props =>
  props.background &&
  colorStyle('background-color', props.background, props.theme)}
${props =>
  colorStyle('color', props.color ? props.color : 'textStrong', props.theme)}
${props =>
  props.background &&
  colorStyle(
    'border-color',
    props.borderColor ? props.borderColor : props.background,
    props.theme,
  )}
  ${props =>
    props.round &&
    css`
      border-radius: ${props.round};
    `}
  ${props =>
    props.pad &&
    edgeStyle(
      'padding',
      props.pad,
      props.responsive,
      props.theme.box.responsiveBreakpoint,
      props.theme,
    )}
    ${props => props.textAlign && textAlignStyle}
    ${props => props.weight && weightStyle}
`;
