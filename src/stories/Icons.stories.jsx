import { Box } from '@chakra-ui/layout';
import React from 'react';
import { useState } from 'react';
import Icon from '../common/components/Icon';

const iconDict = require('../common/utils/iconDict.json');

export default {
  title: 'Components/Icons',
  component: Icon,
  argTypes: {
    icon: {
      control: {
        type: 'input',
      }
    },
    style: {
      control: {
        type: 'object',
      },
    },
    fill: {
      control: 'color',
      table: {
        category: 'Icon Colors',
      },
    },
    color: {
      control: 'color',
      table: {
        category: 'Icon Colors',
      },
    },

    width: {
      control: {
        type: 'range',
        min: 50,
        max: 150,
      },
      table: {
        category: 'Size in px',
      },
    },
    height: {
      control: {
        type: 'range',
        min: 50,
        max: 150,
      },
      table: {
        category: 'Size in px',
      },
    },
  },
};

const Component = (args) => {
  const [searchValue, setSearchValue] = useState('');
  const iconDictSearched = iconDict.filter((icon) => icon?.toLowerCase().includes(searchValue?.toLowerCase()))
  return (
    <>
      <Box width="100%" my="2rem" display="flex" justifyContent="center">
        <Box as="input" shadow="none" height="35px" p="0 15px" border="2px solid" borderColor="gray.400" borderRadius="15px" type="text" placeholder="search icon" onChange={(e) => setSearchValue(e.target.value)} width="180px" />
      </Box>
      <Box display="grid" gridTemplateColumns={`repeat(auto-fill, minmax(${args.width * 2}px, 1fr))`} gridGap="28px" width="100%" height="fit-content">
        {iconDictSearched.map((icon, i) => {
          const index = i;
          return (
            <Box w="auto" height="auto" display="flex" alignItems="center" flexDirection="column" gridGap="8px">
              <Box display="flex" alignItems="center" justifyContent="center" key={index} margin="0 auto" width={`${args.width}px`} height={`${args.height}px`}>
                <Icon icon={icon} color={args.color} style={args.style} width={`${args.width}px`} height={`${args.height}px`} fill={args.fill} />
              </Box>
              <Box style={{ wordWrap: 'normal' }} width="fit-content" textAlign="center" fontSize="14px" letterSpacing="0.05em" background="featuredDark" color="white" p="4px 15px" borderRadius="15px">
                {icon}
              </Box>
            </Box>
          )
        })}
      </Box>
    </>
  )
};
export const Default = Component.bind({});
Default.args = {
  width: 50,
  height: 50,
  color: '#000'
};
