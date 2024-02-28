import MktInfoCards from '../../src/common/components/MktInfoCards';
/**
 * @typedef {import("@prismicio/client").Content.InfoCardsSlice} InfoCardsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<InfoCardsSlice>} InfoCardsProps
 * @param {InfoCardsProps}
 */
const InfoCards = ({ slice }) => {
  return (
    <MktInfoCards
      id={slice?.primary?.id_key}
      title={slice?.primary?.title}
      subTitle={slice?.primary?.subtitle}
      slice={slice}
      cardOneIcon={slice?.primary?.cardOneIcon}
      cardOneColor={slice?.primary?.cardOneColor}
      cardOneTitle={slice?.primary?.cardOneTitle}
      cardOneDescription={slice?.primary?.cardOneDescription}
      cardTwoIcon={slice?.primary?.cardTwoIcon}
      cardTwoColor={slice?.primary?.cardTwoColor}
      cardTwoTitle={slice?.primary?.cardTwoTitle}
      cardTwoDescription={slice?.primary?.cardTwoDescription}
      cardThreeIcon={slice?.primary?.cardThreeIcon}
      cardThreeColor={slice?.primary?.cardThreeColor}
      cardThreeTitle={slice?.primary?.cardThreeTitle}
      cardThreeDescription={slice?.primary?.cardThreeDescription}
      cardFourIcon={slice?.primary?.cardFourIcon}
      cardFourColor={slice?.primary?.cardFourColor}
      cardFourTitle={slice?.primary?.cardFourTitle}
      cardFourDescription={slice?.primary?.cardFourDescription}
      margin={slice?.primary?.margin}
      padding={slice?.primary?.padding}
      paddingMobile="20px"
      fontFamily={slice?.primary?.fontFamily}
    />
  );
};

export default InfoCards;
