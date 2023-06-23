import React from 'react';
import { Box, Text, Paragraph } from 'components/Wrapped';
import styles from './Controls.module.scss';

export const MultilineText = ({ text }) => {
    return (
        <div className={styles.multilineText}>
            {text}
        </div>
    );
};

export const BoxButtonPanel = props => {
    const {
        children,
        direction = "row",
        gap = "small",
        align = "center",
        wrap = false,
        overflow = "auto",
        pad = "none",
        flex = false,
        ...rest
    } = props;

    return (
        <Box
            direction={direction}
            gap={gap}
            align={align}
            wrap={wrap}
            overflow={overflow}
            pad={pad}
            flex={flex}
            {...rest}>
            {children}
        </Box>
    );
};

export const BoxButton = props => {
    const {
        isActive = false,
        className = "pointer",
        pad = { horizontal: 'small', vertical: 'xsmall' },
        border = {
            size: '1px',
            color: isActive ? 'primary' : 'border',
            side: 'all',
        },
        align = "center",
        flex = false,
        level = 5,
        color = isActive ? 'primary' : null,
        onClick,
        children
    } = props;

    return (
        <div
            className={className}
            onClick={onClick}>
            <Box
                pad={pad}
                border={border}
                align={align}
                flex={flex}>
                <Text level={level} color={color}>
                    {children}
                </Text>
            </Box>
        </div>
    );
};

export const KeyValueRow = ({
    label,
    value,
    size,
    margin
}) => {
    const hasTitle = label !== undefined;
    const hasValue = value !== undefined;
    return (
        <Paragraph margin={margin} size={size || "small"}>
            {hasTitle
                ? <Text weight="bold">{label}</Text>
                : ''}
            {hasValue
                ? <Text>{hasTitle ? ': ' : ''}{value}</Text>
                : ''}
        </Paragraph>
    );
};