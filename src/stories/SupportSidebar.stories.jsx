import React from "react";

import SupportSidebar from "../common/components/SupportSidebar";

export default {
  title: "Components/SupportSidebar",
  component: SupportSidebar,
  argTypes: {},
};

const Component = (args) => <SupportSidebar {...args} />;

export const Default = Component.bind({});
Default.args = {};
