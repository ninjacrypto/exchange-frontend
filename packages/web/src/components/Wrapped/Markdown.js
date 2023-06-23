import React from 'react';
import { Markdown } from 'grommet';

import { Paragraph, Heading, Box, Text } from 'components/Wrapped';
import ExternalLink from '../Helpers/ExternalLink';

const UnorderedList = ({ children, ...rest }) => {
  return (
    <Box pad="none" margin={{ horizontal: 'small' }}>
      <Text textAlign="justify">
        <ul {...rest}>{children}</ul>
      </Text>
    </Box>
  );
};

const OrderedList = ({ children, ...rest }) => {
  return (
    <Box pad="none" margin={{ horizontal: 'small' }}>
      <Text textAlign="justify">
        <ol {...rest}>{children}</ol>
      </Text>
    </Box>
  );
};

const ListItem = ({ children, ...rest }) => {
  const [listItem, ...restItems] = children;

  return (
    <Text>
      <li {...rest}>
        <Text textAlign="justify">{listItem}</Text>
        {restItems}
      </li>
    </Text>
  );
};

const WrappedMarkdown = ({ children }) => {
  return (
    <Markdown
      components={{
        a: {
          component: ExternalLink,
        },
        p: {
          component: Paragraph,
          props: {
            size: 'small',
            margin: { vertical: 'xsmall' },
            textAlign: 'justify',
          },
        },
        h1: {
          component: Heading,
          props: {
            level: 1,
          },
        },
        h2: {
          component: Heading,
          props: {
            level: 2,
          },
        },
        h3: {
          component: Heading,
          props: {
            level: 3,
          },
        },
        h4: {
          component: Heading,
          props: {
            level: 4,
          },
        },
        h5: {
          component: Heading,
          props: {
            level: 5,
          },
        },
        ul: {
          component: UnorderedList,
        },
        ol: {
          component: OrderedList,
        },
        li: {
          component: ListItem,
        },
      }}
    >
      {children}
    </Markdown>
  );
};

export default WrappedMarkdown;
