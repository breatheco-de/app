/* eslint-disable no-tabs */
import {
  Box, Checkbox, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, useColorMode, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import { useState } from 'react';
import Link from '../common/components/NextChakraLink';
import getMarkDownContent from '../common/components/MarkDownParser/markdown';
import MarkDownParser from '../common/components/MarkDownParser/ReactMarkdown';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'about-us');
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });

  const fileLanguage = {
    en: 'ABOUT.md',
    es: 'ABOUT.es.md',
  };
  const results = await fetch(
    `https://raw.githubusercontent.com/breatheco-de/app/main/${fileLanguage[locale]}`,
  )
    .then((res) => res.text())
    .catch((err) => console.error(err));

  const markdownContent = getMarkDownContent(results);
  return {
    props: {
      seo: {
        locales,
        locale,
        image,
        unlisted: true,
        pathConnector: '/about-us',
      },
      fallback: false,
      data: markdownContent.content,
    },
  };
};

const MarkdownEditor = ({ data }) => {
  const { colorMode } = useColorMode();
  const [mdInput, setMdInput] = useState();
  const { t } = useTranslation(['common']);
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState({
    editor: true,
    wrap: true,
    fontSize: 15,

  });

  const markdownText = mdInput || `
# About 4Geeks
Our goal is to empower talent with code by providing flexible educational experiences, we want to be the most relevant career-boosting community for future and present coders.

## Why coding?

Embracing the world of coding opens a new world of opportunities for talents, from Web Development to Blockchain, Robotics or AI/Machine Learning.

<onlyfor permission="read_private_lesson">
  
# Hello World
This content was blocked

  - \`read_private_lesson\`
  - user account
  - role access
</onlyfor>

## Cornerstones :+1:

- Content
- Community
- Collaboration
- Support

# Loooooong code block
\`\`\`py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Client(db.Model):
	client_id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(50))
	phone = db.Column(db.Integer)

class Order(db.Model):
	order_id = db.Column(db.Integer, primary_key=True)
	client_id = db.Column(db.String(50), db.ForeignKey('clients.client_id'), db.Column(db.String(50), db.ForeignKey('clients.client_id'), db.Column(db.String(50), db.ForeignKey('clients.client_id'), db.Column(db.String(50), db.ForeignKey('clients.client_id'), db.Column(db.String(50), db.ForeignKey('clients.client_id'), db.Column(db.String(50), db.ForeignKey('clients.client_id')
	invoice = db.Column(db.Integer)

results = db.session.query(Order, Client).outerjoin(Client, full=True).all()

#Printing the results:
for client, order in results:
	print(client.name, order.order_id)
\`\`\`

`;

  return (
    <Box display="flex">
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="30px" paddingBottom={0}>
            Markdown Configuration
          </ModalHeader>
          <ModalBody display="flex" flexDirection="column" gridGap="16px">
            <Checkbox
              onChange={() => setConfig({ ...config, wrap: !config.wrap })}
              isChecked={config.wrap}
            >
              Wrap line
            </Checkbox>
            <Checkbox
              onChange={() => setConfig({ ...config, editor: !config.editor })}
              isChecked={config.editor}
            >
              Markdown Editor
            </Checkbox>
            <Box>
              Font Size
              <NumberInput defaultValue={config.fontSize} min={12} max={30} onChange={(e) => setConfig({ ...config, fontSize: e })}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>

            </Box>

          </ModalBody>
        </ModalContent>
      </Modal>
      {config.editor ? (
        <Box position="sticky" top="0" height="100vh">
          <Box
            as="textarea"
            background="featuredDark"
            color="white"
            resize="none"
            p="10px"
            fontSize={`${config.fontSize}px`}
            placeholder="Markdown here..."
            // value={markdownText}
            onChange={(e) => setMdInput(e.target.value)}
            width="450px"
            height="100%"
            spellCheck="false"
            borderRight="2px solid"
            borderColor="blue.default"
            minH="100vh"
            whiteSpace={config.wrap ? 'nowrap' : 'normal'}
            overflow="auto"
            value={markdownText}
          />
        </Box>
      ) : null}
      <Box
        height="100%"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        padding="35px 0 0 0"
        mx="auto"
        // margin={{ base: '0', md: '0 10% 0 10%' }}
      >
        <Box display="flex" justifyContent="space-between">
          <Link
            href="/"
            display="inline-block"
            padding={{ base: '0px 10px 15px 10px', md: '0' }}
            w="auto"
            borderRadius="15px"
            color="blue.default"
          >
            {`← ${t('common:backToHome')}`}
          </Link>
          <Box ml="20px" color="blue.default" onClick={() => setOpen(true)} cursor="pointer" _hover={{ textDecoration: 'underline' }}>
            CONFIG. Markdown Editor
          </Box>
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          flex="1"
          mt="4%"
          maxW="1012px"
          mx="auto"
          // margin={{ base: '0', md: '4% 10% 0 10%' }}
          // position="absolute"
          // left="30%"
          // right="0%"
        >
          <Box
            padding="28px 32px"
            borderRadius="3px"
            background={useColorModeValue('#F2F6FA', 'featuredDark')}
            width="100%"
            className={`markdown-body ${colorMode === 'light' ? 'light' : 'dark'}`}
            transition="background .2s ease"
          >
            <MarkDownParser content={markdownText || data} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

MarkdownEditor.propTypes = {
  data: PropTypes.string.isRequired,
};

export default MarkdownEditor;
