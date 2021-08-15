import NextLink from "next/link"
import {
  Link as ChakraLink,
} from "@chakra-ui/react"

const NextChakraLink = ({
  href,
  as,
  replace,
  scroll,
  shallow,
  prefetch,
  children,
  ...chakraProps
}) => {
  return (
    <NextLink
      passHref={true}
      href={href}
      as={as}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      prefetch={prefetch}
    >
      <ChakraLink {...chakraProps}>{children}</ChakraLink>
    </NextLink>
  )
}

export default NextChakraLink;