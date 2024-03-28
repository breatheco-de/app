/* eslint-disable no-unsafe-optional-chaining */
import {
  Box,
  useColorModeValue,
  Button,
  useToast,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Grid,
  GridItem,
  ListItem,
  OrderedList,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import React, { useState } from 'react';
import useAuth from '../../common/hooks/useAuth';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import SimpleTable from './SimpleTable';
import ShowOnSignUp from '../../common/components/ShowOnSignup';
import useStyle from '../../common/hooks/useStyle';
import { ORIGIN_HOST } from '../../utils/variables';
import { reportDatalayer } from '../../utils/requests';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';

function TabletWithForm({
  asset,
  commonTextColor,
  commonBorderColor,
  technologies,
  href,
  hideCloneButton,
}) {
  const { t } = useTranslation('exercises');
  const { user } = useAuth();
  const toast = useToast();
  const [formSended, setFormSended] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const { hexColor, lightColor } = useStyle();
  const textColor = commonTextColor || lightColor;
  const borderColor = commonBorderColor || useColorModeValue('gray.250', 'gray.900');
  const conversionTechnologies = technologies?.map((item) => item?.slug).join(',');

  const getTitleMessage = () => {
    if (user) return '';
    if (asset.gitpod) return t('direct-access-interactive');
    if (asset.solution_url) return t('direct-access-solution');
    return t('direct-access-similar');
  };

  const getLoggedTitleMessage = () => {
    if (asset.gitpod) return t('download');
    if (asset.solution_url) return t('access-solution');
    return t('similar-projects');
  };

  const ReportOpenInProvisioningVendor = (vendor = '') => {
    reportDatalayer({
      dataLayer: {
        event: 'open_interactive_exercise',
        user_id: user.id,
        vendor,
      },
    });
  };

  const UrlInput = styled.input`
    cursor: pointer;
    background: none;
    width: 100%;
    &:focus {
      outline: none;
    }
  `;

  return (
    <>
      <Box px="10px" pb="20px" display={{ base: 'block', md: 'none' }}>
        <SimpleTable
          href={href}
          difficulty={asset.difficulty !== null && asset.difficulty.toLowerCase()}
          repository={asset.url}
          duration={asset.duration}
          videoAvailable={asset.gitpod ? asset.solution_video_url : null}
          solution={asset.gitpod ? asset.solution_url : null}
          liveDemoAvailable={asset.intro_video_url}
          technologies={technologies}
        />
      </Box>
      <Box
        backgroundColor={useColorModeValue('white', 'featuredDark')}
        transition="background 0.2s ease-in-out"
        borderRadius="17px"
        border={2}
        borderStyle="solid"
        borderColor={hexColor.greenLight}
        overflow="hidden"
      >
        <ShowOnSignUp
          headContent={asset?.intro_video_url && (
            <ReactPlayerV2
              title="Video tutorial"
              withModal
              url={asset?.intro_video_url}
              withThumbnail
              thumbnailStyle={{
                borderRadius: '0 0 0 0',
              }}
            />
          )}
          hideForm={!user && formSended}
          title={getTitleMessage()}
          submitText={t('get-instant-access')}
          subscribeValues={{ asset_slug: asset.slug }}
          refetchAfterSuccess={() => {
            setFormSended(true);
          }}
          padding={`${asset?.intro_video_url ? '10px' : '20px'} 22px 30px 22px`}
          background="none"
          border="none"
          conversionTechnologies={conversionTechnologies}
          borderRadius="0"
        >
          <>
            {user && !formSended && (
              <Heading
                size="15px"
                textAlign="center"
                textTransform="uppercase"
                width="100%"
                fontWeight="900"
                mb="0px"
              >
                {getLoggedTitleMessage()}
              </Heading>
            )}
            {formSended && (
              <>
                <Icon style={{ margin: 'auto' }} width="104px" height="104px" icon="circle-check" />
                <Heading
                  size="15px"
                  textAlign="center"
                  textTransform="uppercase"
                  width="100%"
                  fontWeight="900"
                  mt="30px"
                  mb="0px"
                >
                  {t('thanks')}
                </Heading>
                <Text size="md" color={textColor} textAlign="center" marginTop="10px" px="0px">
                  {t('download')}
                </Text>
              </>
            )}
            {asset.gitpod ? (
              <>
                <Button
                  borderRadius="3px"
                  width="100%"
                  padding="0"
                  whiteSpace="normal"
                  variant="default"
                  color="white"
                  fontSize="14px"
                  alignItems="center"
                  background={hexColor.greenLight}
                  onClick={() => setShowModal(true)}
                >
                  {'  '}
                  <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="learnpack" color="currentColor" />
                  {t('open-learnpack')}
                </Button>
                <Button
                  borderRadius="3px"
                  width="100%"
                  fontSize="14px"
                  padding="0"
                  whiteSpace="normal"
                  variant="otuline"
                  border="1px solid"
                  textTransform="uppercase"
                  borderColor={hexColor.greenLight}
                  color={hexColor.greenLight}
                  onClick={() => {
                    ReportOpenInProvisioningVendor('local');
                    setShowCloneModal(true);
                  }}
                >
                  {t('clone')}
                </Button>
              </>
            ) : (
              <>
                {asset.solution_video_url && (
                  <Link
                    borderRadius="3px"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={asset.solution_video_url}
                    background={hexColor.greenLight}
                    color="white !important"
                    letterSpacing="0.05em"
                    textDecoration="none !important"
                    padding="7px 16px !important"
                    textAlign="center"
                    fontWeight="600"
                  >
                    {t('common:watch-video-solution')}
                  </Link>
                )}
                {asset.solution_url && (
                  <Link
                    borderRadius="3px"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={asset.solution_url}
                    border="1px solid"
                    borderColor={hexColor.greenLight}
                    color={asset.solution_video_url ? hexColor.greenLight : 'white !important'}
                    background={asset.solution_video_url ? 'none' : hexColor.greenLight}
                    letterSpacing="0.05em"
                    textDecoration="none !important"
                    padding="7px 16px !important"
                    textAlign="center"
                    fontWeight="600"
                  >
                    {t('common:review-solution')}
                  </Link>
                )}
              </>
            )}
          </>
        </ShowOnSignUp>
        <Modal
          isOpen={showModal}
          size="xl"
          margin="0 10px"
          onClose={() => {
            setShowModal(false);
          }}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader borderBottom="1px solid" fontSize="15px" textTransform="uppercase" borderColor={borderColor} textAlign="center">
              {t('modal.title')}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody padding={{ base: '30px' }}>
              <Text marginBottom="15px" fontSize="14px" lineHeight="24px" textAlign="center">
                {t('modal.text-part-one')}
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={2} marginBottom="15px">
                <GridItem w="100%">
                  <Button
                    borderRadius="3px"
                    width="100%"
                    fontSize="14px"
                    padding="0"
                    whiteSpace="normal"
                    variant="otuline"
                    border="1px solid"
                    borderColor="blue.default"
                    fontWeight="700"
                    color="blue.default"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        ReportOpenInProvisioningVendor('gitpod');
                        window.open(`https://gitpod.io#${asset.url}`, '_blank').focus();
                      }
                    }}
                  >
                    {'  '}
                    <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="gitpod" color={hexColor.blueDefault} />
                    Gitpod
                  </Button>
                </GridItem>
                <GridItem w="100%">
                  <Button
                    borderRadius="3px"
                    width="100%"
                    fontSize="14px"
                    padding="0"
                    whiteSpace="normal"
                    variant="otuline"
                    border="1px solid"
                    borderColor="blue.default"
                    fontWeight="700"
                    color="blue.default"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        ReportOpenInProvisioningVendor('codespaces');
                        window.open(`https://github.com/codespaces/new/?repo=${asset.url.replace('https://github.com/', '')}`, '_blank').focus();
                      }
                    }}
                  >
                    {'  '}
                    <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="github" color={hexColor.blueDefault} />
                    Github Codespaces
                  </Button>
                </GridItem>
              </Grid>
              <Text
                // cursor="pointer"
                id="command-container"
                padding="9px"
                background={useColorModeValue('featuredLight', 'darkTheme')}
                fontWeight="400"
                marginBottom="5px"
                style={{ borderRadius: '5px' }}
                textAlign="center"
                fontSize="14px"
                lineHeight="24px"
              >
                {t('modal.text-part-two')}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${ORIGIN_HOST}/lesson/how-to-use-gitpod`}
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                  color="blue.default"
                >
                  Gitpod
                </Link>
                {t('modal.or')}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${ORIGIN_HOST}/lesson/what-is-github-codespaces`}
                  color="blue.default"
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                >
                  Github Codespaces
                </Link>
              </Text>

            </ModalBody>
          </ModalContent>
        </Modal>
        <Modal
          isOpen={showCloneModal}
          size="md"
          margin="0 10px"
          onClose={() => {
            setShowCloneModal(false);
          }}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader borderBottom="1px solid" fontSize="15px" textTransform="uppercase" borderColor={borderColor} textAlign="center">
              {t('clone-modal.title')}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody padding={{ base: '30px' }}>
              <Text marginBottom="15px" fontSize="14px" lineHeight="24px">
                {t('clone-modal.text-part-one')}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://marketplace.visualstudio.com/items?itemName=learn-pack.learnpack-vscode"
                  color={useColorModeValue('blue.default', 'blue.300')}
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                >
                  Learnpack Plugin
                </Link>
                {t('clone-modal.text-part-two')}
              </Text>
              {!hideCloneButton && (
                <Grid templateColumns="repeat(2, 1fr)" gap={2} marginBottom="15px">
                  <GridItem w="100%">
                    <Button
                      borderRadius="3px"
                      width="100%"
                      fontSize="14px"
                      padding="0"
                      whiteSpace="normal"
                      variant="otuline"
                      border="1px solid"
                      borderColor="blue.default"
                      fontWeight="700"
                      color="blue.default"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.open(`https://gitpod.io#${asset.url}`, '_blank').focus();
                        }
                      }}
                    >
                      {'  '}
                      <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="gitpod" color={hexColor.blueDefault} />
                      Gitpod
                    </Button>
                  </GridItem>
                  <GridItem w="100%">
                    <Button
                      borderRadius="3px"
                      width="100%"
                      fontSize="14px"
                      padding="0"
                      whiteSpace="normal"
                      variant="otuline"
                      border="1px solid"
                      borderColor="blue.default"
                      fontWeight="700"
                      color="blue.default"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.open(`https://github.com/codespaces/new/?repo=${asset.url.replace('https://github.com/', '')}`, '_blank').focus();
                        }
                      }}
                    >
                      {'  '}
                      <Icon style={{ marginRight: '5px' }} width="22px" height="26px" icon="github" color={hexColor.blueDefault} />
                      Github Codespaces
                    </Button>
                  </GridItem>
                </Grid>
              )}
              <Text
                // cursor="pointer"
                id="command-container"
                padding="9px"
                background={useColorModeValue('featuredLight', 'darkTheme')}
                fontWeight="400"
                marginBottom="5px"
                style={{ borderRadius: '5px' }}
                textAlign="center"
                fontSize="14px"
                lineHeight="24px"
              >
                <UrlInput
                  id="clone-command"
                  value={`git clone ${asset.url}`}
                  type="text"
                  readOnly
                  onClick={(e) => {
                    e.target.select();
                    navigator.clipboard.writeText(`git clone ${asset.url}`);
                    toast({
                      title: t('clone-modal.copy-command'),
                      status: 'success',
                      duration: 7000,
                      isClosable: true,
                    });
                  }}
                />
              </Text>
              <Text marginBottom="15px" fontSize="12px" fontWeight="700" lineHeight="24px">
                {t('clone-modal.note', { folder: asset?.url ? asset?.url?.substr(asset?.url?.lastIndexOf('/') + 1, asset?.url?.length) : '' })}
              </Text>
              <OrderedList>
                {t('clone-modal.steps', {}, { returnObjects: true }).map((step) => (
                  <ListItem key={step} fontSize="14px">{step}</ListItem>
                ))}
              </OrderedList>
              <Text display="flex" alignItems="center" marginTop="15px">
                <span>
                  <Icon width="19px" height="19px" style={{ display: 'inline-block' }} icon="help" />
                </span>
                <Link
                  href={t('clone-link')}
                  target="_blank"
                  rel="noopener noreferrer"
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                  color="blue.default"
                >
                  Gitpod
                </Link>
                {t('modal.or')}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${ORIGIN_HOST}/lesson/what-is-github-codespaces`}
                  color="blue.default"
                  display="inline-block"
                  letterSpacing="0.05em"
                  fontFamily="Lato, Sans-serif"
                >
                  Github Codespaces
                </Link>
              </Text>

            </ModalBody>
          </ModalContent>
        </Modal>
        <Box px="22px" pb="0" pt="0" display={{ base: 'none', md: 'block' }}>
          <SimpleTable
            href={href}
            difficulty={asset.difficulty !== null && asset.difficulty.toLowerCase()}
            repository={asset.url}
            duration={asset.duration}
            videoAvailable={asset.gitpod ? asset.solution_video_url : null}
            solution={asset.gitpod ? asset.solution_url : null}
            liveDemoAvailable={asset.intro_video_url}
            technologies={technologies}
          />
        </Box>
      </Box>
    </>
  );
}

TabletWithForm.propTypes = {
  commonTextColor: PropTypes.string,
  commonBorderColor: PropTypes.string,
  asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  technologies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  href: PropTypes.string.isRequired,
  hideCloneButton: PropTypes.bool,
};

TabletWithForm.defaultProps = {
  technologies: [],
  commonTextColor: null,
  commonBorderColor: null,
  hideCloneButton: false,
};

export default TabletWithForm;
