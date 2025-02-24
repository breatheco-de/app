import React from 'react';

import Masonry from 'react-masonry-css';
import {
  Box,
  Image,
  Text,
  Tag,
  Link,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  SearchIcon,
  CloseIcon,
  ArrowForwardIcon,
} from '@chakra-ui/icons';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../../common/hooks/useStyle';
import Icon from '../../common/components/Icon';

function Talentcard() {
  const { t } = useTranslation('works-talent');
  const { hexColor } = useStyle();
  const roleTags = [
    { nameTag: 'Fullstack Developer', colorTag: '#0097CF', bgTag: '#EEF9FE' },
    { nameTag: 'Python', colorTag: '#0097CF', bgTag: '#EEF9FE' },
    { nameTag: 'South America', colorTag: '#0097CF', bgTag: '#EEF9FE' },
    { nameTag: 'A2-B1', colorTag: '#0097CF', bgTag: '#EEF9FE' },
    { nameTag: 'CSS', colorTag: '#0097CF', bgTag: '#EEF9FE' },
  ];

  const skillTags = [
    { name: 'Full Stack Developer', color: '#0097CF', bg: '#EEF9FE' },
    { name: 'Data Science', color: '#FFB718', bg: '#FFF4DC' },
  ];

  const breakpointColumnsObj = {
    default: 3,
    1280: 3,
    1100: 3,
    768: 2,
    500: 1,
  };

  const talentNamesPhotos = [
    { name: 'Alan Estrada', photo: 'https://s3-alpha-sig.figma.com/img/18e7/ae15/4f0723add520624002b0248a93479fa6?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=E2liyYnq7prc2L2b1y2pkMZ2LLyREfF8lBGVtYE8XytHp2mojwD8VvkvAaeKNZ6jUp1JRcMgYhlDRG0PsrfIANt7rUvzWlXraXm1lYU35R43w1vG6yAcroXeneukTZUW5nPxlc7xDMdXoFkqYyXg0ztFgy-w0P84H8N1AiksENOy4qNzh6xQi2cUk6T5IXz7Gvl-hH4p5RhHfNKS3ZbtVHHeEMj-UEIwvzMBKFtb-rowWD33U9D5r7CcGHqSlzqB25g0ZV44BMdxHM71whD5wUM-naodd-rWRs-ljRU5Q5Y8wCta-O6GKXXyo9mKgNzIqfEKTWULNfZXLkrVSWukTQ__' },
    { name: 'Alberto Manuel Lazo Begazo', photo: 'https://s3-alpha-sig.figma.com/img/6a09/750e/ff543cba4591ca31b54c754bf055d355?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=GH9zD0-7RlkkZ8WEKKA7sC-4NxaPgOs9ivTFYOy0Tj3E6axmkjte3yCguJMFqQT9oRdtRJBHWRKeyk6UYOJA3qkyeZ2SV7pTr1I6XrPvdgD~rbPj2Z4gX~7Ef78DS2Aa2elxWwzhZqF6IQ1GhZLX-3lV7G9cTPdKNp26nHR7l3OvrWTUMbVltAnWYitwmyrjB3Sl8j4VxddO-pLW5KFuG6CtaKcFCPvhsEAkZZIqeQ0~xrYClXJ4u4K4huiEEcf-pWLh8L0Wkjf5wk-I2XBea1zEDz2Fji6Hvu8ZcFlnDOH0ACR~dBFDLq8tSkZSEORiJ9jEmcE9GZrKkxiPdn3Slg__' },
    { name: 'Andrea Bobadilla', photo: 'https://s3-alpha-sig.figma.com/img/c28d/ec3d/2b74380df84886727317ea735567a66e?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=CThtqb1FKlu~jkCjxxLPed~RTES9d3rpTGDSxDbon92Nr4tmlukCmr2RFfEQkBVfRtXNiHpYqbzGfozx9uqgkU8sI5TuMPM9Ak5z2eRuisTK0zjdZiCccTOW-vkM007KitdD1b-VFDkBKVvlua4476TaL5yLx5NYmhnJwfnHCG3rL~PhM4un8jwoiLqWT7IaB-9dTgYIVqcxeJn4-PD4RjxsVCYul65Df2SEx708nEy80P8sK7ImUXdgyCsm9GiDWrV4dStt8EyEgkp~Nv8lSfElpXoLoY0KRXGba01gIhisX7vOXalDMEJAuEnO5O24uH3LQhTzX5ZDi3cHwhekcw__' },
    { name: 'Alejandro Gonzáles', photo: 'https://s3-alpha-sig.figma.com/img/844a/aec2/6c1af304fabefb0777e59bbf32425bec?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=uV35THKg6Pbkf5FapLmHRMsRvu66Vpg4WGqytjuTI4hAvRh4-1uIE2txP0wXjTg4Dt-tAMgsldI5he3Y4MD9QFKN4ZwJlURc1IQcH02XeLjktZKq5Ui5Umhj4ATWjrXzniYk0mVMRUlg05hBOGXI08gqTQPU9G5vnqq23D7~By4rPj72OFsuhdiTymCWPexUjd4LpeiIfXHxJNlFIc8LHp~0tw1rgnxAdFRciMi4ziVXH9gXP7AvcAZNz3vOYwHQLHBUweR5J0iFFQRbPw1QAwYycdzFJs1dHNsfyqmTA6knNFT8algrSd4xe09VTAwTtAAn3uwSmXGii0rVB8L6uA__' },
    { name: 'Alfredo Castañeda', photo: 'https://s3-alpha-sig.figma.com/img/027f/4cdc/e91035e4b2e6e4bc83366306a876a3cb?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=NFZYJgHceZqEeQywd~Y0Vp6W-ZyVG1eIZNjnPdSz2phhIDJopqf8vBvPM4znvDcJ73vqYYbEQjSO-vJH8STCKM-jJ3ZW~oU9VgL41g09Ctf8Aqys5cejSNDV5faVSuaRQbFvhFLsyELxbveYLYAgohqJEL4pK~3vt~dgYhpzHlrZ8zhhXwr7XBuihP6mHzXsGU~UU4yzEfSjZEZzqKhyJWP2YSNDDW7dayfj1S-8eSLTKJAy7r9oFIRoNXiGUQQilrGP5NOkb2xd4sbTkyNpigZaj7UtkMnHHxt0sXkyvHV2cNPpNBUX4DhfilAcuj4fhRkJWmaFDhWbhmUMqdl9yw__' },
    { name: 'Carmyn Hale', photo: 'https://s3-alpha-sig.figma.com/img/8bb1/3e43/6647bc4966c900660e8fdbfca66515cb?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=NNs0sm79aX2cO9lv5OGMZ7j30oYqWFcZVqt5VPzO4aFq6TJYUdjgwERhVuKWEIqVjz2iZmbKdPOxQ4OpVmZitNH0U2xwJ4b~talTRkCFSrenwkjCJ7EFd8sJ~ZO4aUsAISZc2sV9cDrrc-Vq-wsmaIRyyErtcAS9uWf5lU9DQ8iAZpKWy9lc0PXeejF2zqytuG88sPPFjowkW7Lneyxq~gwTn4NWcbG8ycV5EiSty1HMKfvpSUnZ9koha64JlxWXjEsshBDrYa8rXvAdSB8ic7hw71p9pb~g~7Ky22tzHEzyCM870I5zZZ3pNglNcnAEdV3VJTTn-GkeVnhcy8HEtw__' },
    { name: 'Andrew Morales', photo: 'https://s3-alpha-sig.figma.com/img/4c4c/7cb0/61c54f47e6bd57bac0b5b2388de82ddc?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qutt9gGeQzD9vTN8V9UxVVbOcOvYZlvkxt3yiY7--r32iY-x~WIxNeiRqZX~eO4CrP6uDQf5aUiFi-dFI56Crn9qQJxV671H04joP9c-ajYAU61ai-mcp2u5BTgZ7iOf4t~da7j8QHxDEqJF3DBBol5TALXJpA8hdzRVXqb2S7O1-TVVafYYGt28PqgKxu6I~JA5ECN~~s-4gATN3CgPbCwbXacimdLKCyzzQXFj7A3E21cbP17RXr49yqaVysz-b18uUgGFTTc5allvgYP6FqN0orCPIKO4OlAmt62KlVFgnYe5LxnknjNfDvEXKIiFIV2De45RiEpVX3MwhTMF2g__' },
    { name: 'Cantrell Andrews', photo: 'https://s3-alpha-sig.figma.com/img/91d0/bb5b/1290504a48e0433a1213079a9fbcfd24?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=lys4G2-qIQivTr-7i9DXv~Z8giG5xKLSqokOLiqJcDNHbAjscSoJGWQ3FHXbOZLbHjVGLnu2C~MRdMlr0pLH4~yMfUqGQvvcFNses7hiRugNTvgaGlHyoSkWjL3G57NicB4v0GdTuzNc~NRInhtSxjwmLVRBoNHyPlumWRIoi7EXA-SaAhbtfo-SQcKTzOe1r4GFz8WfxG7YHzWAmyBOf0nXkevB7MsUkT1K0WztQCZQ6GS1yjjhdifTk8DCmcPPq5X5VuufNowLXyT1Xc8l3pByiDhlHMyEKLPdb~YJ6XOJ7fxAmXiuFIJ7HcQPLUR4qmNDT649C~Kj9Pg6iiM5EA__' },
    { name: 'Daniella Louis', photo: 'https://s3-alpha-sig.figma.com/img/49ce/7dbe/c9a8b7411e69a04133c691e503b26922?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=PBof~d0-w4NKLzczTWavW45a9QUPUaNa83~TvcSrZU8OnSHFbFCfqGe6gTaHYlvsfpdoGYzYBJqmlEhTaAD5w2Agb36I4PNE2d8K0jn3OvXgyxMP3p38~QdvgcR58x-VINDj5W1QtVPV7i6XXi9XE~F9-BunOHH9VdbshlUt0fDB-nge1WS8KeszHB98fPlzcgyNnnxIDake5sRoaE5lEjt7HTNE6XXtNfAfUCXhBKrcmqJd6jQJce-unBAECKWZMdHBS92x1eu-TdvRT4PgeXjFB4St4LLfSCUZVBhJjymDaE81~8KmH6rW025Zc1j6tzVQcYwoUgu0GwmIOMltYw__' },
    { name: 'Cristopher García', photo: 'https://s3-alpha-sig.figma.com/img/0162/9dc4/aaa7a21743138ae99f8b93a4c5c55e41?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=UIfC1NM5XavHuqxvNfT~ZSz6RcoEffpVByHd7rh4jcH~4KauitRFe3p4GSI2IV7MGJsGDmJwxBqL4-3EdUX2neKzMwlHq9120ZItPuxKxj6OJRJ4p3M3aQMwmwAG8mWCrS71-~oH5wb10fUj0iqbtTQ8WlEs3jELWQcQEhcQKz3xTBHgnvPp2kLLDXNPgfCBNEJVJisUrxNB3uoGAwR-dQNHlNy03g56JKXSOA1e1gbNBlQQrJWEyR5f-RNFSHTPIkbWg4zwSb07S2BZnxU2OhuVWgizOJNUdyNU28HUeic78Fjve8VAer8gjlMxCyzbQnu-MyW2ZrVhSLUs7sGvLA__' },
    { name: 'Divya Pimprakar', photo: 'https://s3-alpha-sig.figma.com/img/d2a6/fa1c/f0ad3f5eb5f08f6d73993c32b8b36652?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=DvuGcxTX-UdF859BTaxaBMDdRqw3YwfcHcS5Ecz-4NN4UkisqA5EDfGJnC8s1gPz56HvsekM6q6A8mQAwMo3Zso7VyzBNn~LClTWF62LzXvGt6KbhHRuo24Hn4U00zj8jhOfE4dsnsiBlgqM8NNmbBp7Q~0S1MA8fdm-IGBBTQIk7SbUjB8bCB6eKVduoH9bit~5ckpGLigQN4J5Ghvdx7WXjUcVfXqyyZMDrPxfwV2csqM3SAAC3aUYMW2oUZ3D~CEYeG33jwfWo8SZJRwJQOS40mi3LV2owx7U57U8ZIR7yQ5loW7e7k1d3FblxFDFbhg-lL6D3mUffMn7ZKavJg__' },
    { name: 'Eliza Quast', photo: 'https://s3-alpha-sig.figma.com/img/8ac9/67ef/636423e5ea55f6dda902417ddc671b5b?Expires=1740960000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=K2QJQlew0vVJKNsPc3KUhcUWP~17ncTquwY~~uEuO0YRTjgjSBrqIx0EpOTttbeSFUiF-m0g6nfQas2UF214HfJojhC9HObIMwTzhHSKBI~X4UrtN9s9ltUChO-bOqvHtiCgsE5ccE03NV7i2Ix3WYcnL8GH1AHeitMT7V5zDGrHLtJ4XDjOkyW2X6-TbU-CdgrleAoGR9eWZ1IQmf9QF92p9cjRIsyYkD-TLmaqrnXJuoFSAUC1aEIP1WAnlo~D78vhUwOmBB9snjG1MzHz8kKBEJLzMkKkxyCFemm9uoZSwn7BoPlrbOzLt7IRypbLgrAoPO5ChbnonGM-Kpyorg__' },
  ];

  return (
    <Box mb={10} ms={10} mx={10} bg={useColorModeValue('#EEF9FE', hexColor.backgroundColor)} margin="0px" padding="18px 0px 0px">
      <Box>
        <Flex justify="space-between" align="center" mb={4} ml={3} my={3} mt="18px" paddingLeft="20px">
          <Link href="/" _hover={{ textDecoration: 'none' }}>
            <Text color="#0097CF" fontWeight="700" fontSize="17px" lineHeight="20.4px" letterSpacing="0%">
              {`← ${t('works-talent:pagination.go-back')}`}
            </Text>
          </Link>
        </Flex>
      </Box>

      <Box bg={hexColor.backgroundColor} p={10} borderRadius="13px" margin={10} padding={6} gap={6}>
        {/* Search Bar */}
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input placeholder="Full Stack developer" fontFamily="Lato" fontWeight={400} fontSize="15px" lineHeight="22px" letterSpacing="2%" />
          <InputRightElement>
            <Button size="big" bg="#0097CF" _hover={{ bg: '#0077A8' }} padding={2} gap="10px" variant="default" borderRadius="4px">
              <ArrowForwardIcon
                color="white"
                boxSize={6}
                transform="scaleX(1.0)"
              />
            </Button>
          </InputRightElement>
        </InputGroup>

        <Flex justify="space-between" align="center" mt={4} w="100%">
          <Text mt={2} fontSize="12px" color={useColorModeValue('#000000', '#FFFFFF')} fontWeight={400} lineHeight="14.4px" letterSpacing="0%" fontFamily="Lato">
            {`${t('works-talent:showing-results-for')}`}
          </Text>
          {/* Filter Button */}
          <Button
            mt={2}
            size="sm"
            colorScheme="blue"
            bg="#0097CF"
            color="white"
          >
            <Icon icon="setting" margin="8px" color="#FFFFFF" />
            {`${t('works-talent:filters')}`}
          </Button>
        </Flex>

        {/* Tags with option to eliminate */}
        <Flex mt={2} gap={2} flexWrap="wrap">
          {roleTags.map((tag, index) => (
            <Tag
              key={index.id}
              size="md"
              borderRadius="18px"
              px={3}
              color={hexColor.blue3}
              bg={hexColor.featuredColor}
              padding="4px 8px"
              gap={2}
            >
              {tag.nameTag}
              <CloseIcon
                ml={2}
                boxSize={2.5}
                cursor="pointer"
                color={tag.color}
              />
            </Tag>
          ))}
        </Flex>
      </Box>

      <Box bg={hexColor.backgroundColor} padding="32px 40px">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {[...Array(12)].map((_, index) => {
            const randomTag = skillTags[Math.floor(Math.random() * skillTags.length)];
            return (
              <Box
                key={index.id}
                borderRadius="8px"
                overflow="hidden"
                bg={hexColor.backgroundColor}
                className="masonry-brick"
                border="1px solid"
                borderColor={hexColor.borderColor}
              >
                <Image
                  src={talentNamesPhotos[index]?.photo}
                  alt="Talent Profile"
                  borderRadius="8px 0px 0px 0px"
                  width="100%"
                  maxWidth="1280px"
                  height="161px"
                  objectFit="cover"
                  objectPosition="center"
                />
                <Flex
                  padding={2}
                  gap={2}
                  key={index.id}
                  justify="space-between"
                  align="center"
                >
                  <Text fontSize="18px" fontFamily="Lato" fontWeight={400} lineHeight="21.6px" letterSpacing="0%">
                    {talentNamesPhotos[index]?.name}
                  </Text>
                  <Tag
                    fontFamily="Lato"
                    fontSize="9px"
                    lineHeight="10.8px"
                    letterSpacing="5%"
                    color={useColorModeValue(randomTag.color, hexColor.black)}
                    bg={useColorModeValue(randomTag.bg, '#283340')}
                    px={3}
                    borderRadius="full"
                    textAlign="center"
                  >
                    {randomTag.name}
                  </Tag>
                </Flex>
                <Divider borderColor={hexColor.borderColor} />
                <Text
                  fontSize="14px"
                  my={2}
                  fontFamily="Lato"
                  fontWeight={400}
                  lineHeight="16.8px"
                  padding="8px 8px 8px 8px"
                >
                  {`${t('works-talent:card-student.description')}`}
                </Text>
                <Flex justify="center">
                  <Link href="/profile" _hover={{ textDecoration: 'none' }}>
                    <Text
                      padding={2}
                      color="#0097CF"
                      fontWeight="400"
                      fontSize="12px"
                      lineHeight="14.4px"
                      letterSpacing="0%"
                      fontFamily="Lato"
                    >
                      {`${t('works-talent:card-student.link')}`}
                    </Text>
                  </Link>
                </Flex>
              </Box>
            );
          })}
        </Masonry>
      </Box>
    </Box>
  );
}

export default Talentcard;
