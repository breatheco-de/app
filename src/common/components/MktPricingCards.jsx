// import { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import PricingCard from "./PricingCard";

// function MktPricingCards({ id, title, url }) {
//   const [plans, setPlans] = useState([]);
// //   useEffect(() => {
// //     fetch("/plans-info.json")
// //       .then((response) => response.json())
// //       .then((data) => setPlans(data))
// //       .catch((error) => console.error("Error al cargar el JSON:", error));
// //   }, []);
//   return (
//     <>
//       {plans.map((plan) => (
//         <PricingCard
//             courseData={plan}
//         />
//       ))}
//     </>
//   );
// }

// MktPricingCards.propTypes = {
//   id: PropTypes.string,
//   title: PropTypes.string,
//   url: PropTypes.string,
// };

// MktPricingCards.defaultProps = {
//   id: "",
//   title: null,
//   url: "",
// };

// export default MktPricingCards;
