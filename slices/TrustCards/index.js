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
      title={slice?.primary?.title}
      description={slice?.primary?.description}
      fontFamily={slice?.primary?.fontFamily}
    />
  );
};

export default TrustCards;
