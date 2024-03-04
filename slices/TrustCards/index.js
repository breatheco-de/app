import MktTrustCards from '../../src/common/components/MktTrustCards';

/**
 * @typedef {import("@prismicio/client").Content.TrustCardsSlice} TrustCardsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<TrustCardsSlice>} TrustCardsProps
 * @param {TrustCardsProps}
 */
const TrustCards = ({ slice }) => {
  return (
    <MktTrustCards
      id={slice?.primary?.id_key}
      slice={slice}
      title={slice?.primary?.title}
      fontFamily={slice?.primary?.fontFamily}
      padding={{ base: '20px', md: '0' }}
    />
  );
};

export default TrustCards;
