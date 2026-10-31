import { Spinner, VStack, type StackProps } from "@chakra-ui/react";

export const Loader = (props: StackProps) => (
  <VStack py="20" w="full" {...props}>
    <Spinner size="xl" color="lime" borderWidth="3px" />
  </VStack>
);

export default Loader;
