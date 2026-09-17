import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useCallback, useEffect, useRef, useState } from 'react';
import useStyle from '../../../hooks/useStyle';
import useCustomToast from '../../../hooks/useCustomToast';
import { getToken } from '../../../utils';
import Text from '../../Text';
import Icon from '../../Icon';

const TOKEN_MASK = '••••••••••••••••••••••••';

async function copyTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('clipboard-unavailable');
  }

  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'fixed';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(el);
  if (!ok) throw new Error('copy-failed');
}

function SessionToken() {
  const { t } = useTranslation('profile');
  const { borderColor2, lightColor } = useStyle();
  const { createToast } = useCustomToast();
  const tokenRef = useRef('');
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const value = getToken() || '';
    tokenRef.current = value;
    setHasToken(value.length > 0);
    setIsReady(true);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!tokenRef.current) return;
    try {
      await copyTextToClipboard(tokenRef.current);
      createToast({
        title: t('session-token.copied'),
        status: 'success',
      });
    } catch {
      createToast({
        title: t('session-token.copy-error'),
        status: 'error',
      });
    }
  }, [createToast, t]);

  const displayValue = isRevealed && hasToken ? tokenRef.current : TOKEN_MASK;

  return (
    <Box
      display="flex"
      flexDirection={{ base: 'column', lg: 'row' }}
      alignItems={{ base: 'center', lg: 'start' }}
      gridGap="38px"
      width="100%"
      height="auto"
      borderRadius="17px"
      border="1px solid"
      borderColor={borderColor2}
      p="30px"
    >
      <Box width="100%">
        <Box width="100%" mb="18px">
          <Text fontSize="16px" fontWeight="700">
            {t('session-token.title')}
          </Text>
          <Text fontSize="14px" color={lightColor}>
            {t('session-token.description')}
          </Text>
        </Box>

        {isReady && !hasToken && (
          <Text size="md" fontWeight="400">
            {t('session-token.missing')}
          </Text>
        )}

        {isReady && hasToken && (
          <>
            <Text size="sm" fontWeight="600" mb="6px">
              {t('session-token.label')}
            </Text>
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              alignItems={{ base: 'stretch', sm: 'center' }}
              gridGap="10px"
              width="100%"
            >
              <InputGroup size="md" flex="1">
                <Input
                  value={displayValue}
                  isReadOnly
                  name="session-token"
                  autoComplete="off"
                  spellCheck={false}
                  borderColor="blue.default"
                  borderRadius="3px"
                  fontFamily={isRevealed ? 'mono' : 'inherit'}
                  letterSpacing={isRevealed ? '0.02em' : '0.12em'}
                  userSelect={isRevealed ? 'text' : 'none'}
                  cursor={isRevealed ? 'text' : 'default'}
                  textOverflow="ellipsis"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  pr="3rem"
                />
                <InputRightElement width="3rem" height="100%">
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={isRevealed ? t('session-token.hide-aria') : t('session-token.reveal-aria')}
                    icon={isRevealed ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setIsRevealed((prev) => !prev)}
                  />
                </InputRightElement>
              </InputGroup>
              <Button
                type="button"
                variant="default"
                backgroundColor="blue.default"
                color="white"
                fontSize="14px"
                fontWeight="700"
                textTransform="uppercase"
                flexShrink={0}
                leftIcon={<Icon icon="copy" size="18px" />}
                onClick={handleCopy}
              >
                {t('session-token.copy-button')}
              </Button>
            </Flex>
            <Box bg="yellow.light" p="12px" borderRadius="md" mt="14px">
              <Flex alignItems="flex-start" gap={3}>
                <Icon icon="warning" height="20px" width="30px" />
                <Text fontSize="14px" color="gray.500" fontWeight="600">
                  {t('session-token.warning')}
                </Text>
              </Flex>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default SessionToken;
