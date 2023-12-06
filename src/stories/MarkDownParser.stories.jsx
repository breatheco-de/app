import React,{useEffect} from 'react';
import MarkDownParser from '../common/components/MarkDownParser';
import { ORIGIN_HOST } from '../utils/variables';


const frontMatter = {
  title: "CSS Layouts: Create and Build Layouts with CSS",
  subtitle: "Building layouts is the most painful process when coding HTML & CSS. Learn the CSS layout rules: Display, Position, Float and Flex; and place any element anywhere you want.",
  cover_local: `${ORIGIN_HOST}/_next/image?url=https%3A%2F%2Fgithub.com%2Fbreatheco-de%2Fexercise-starwars-api%2Fblob%2Fmain%2F.learn%2Fassets%2Fpreview.png%3Fraw%3Dtrue&w=1920&q=100`,
  textColor: "white",
  date: "2020-10-19T16:36:31+00:00",
  tags: ["box-model","CSS","HTML","layouts"],
  status: "published",
};

export default {
  title: 'Components/MarkDownParser',
  component: MarkDownParser,
  argTypes: {
   
    permission: {
    options: ['Get my certificate','Add code reviews','Join mentorship'],
    control: 'select',
  },
  },
};

const Component = (args) => {

const renderCodeName = () =>{
if(args.permission == "Add code reviews")
  return "add_code_review"
else{
  return args.permission?.toLowerCase().split(" ").join("_")
}

}

useEffect(() => {
  let data = JSON.stringify(
    {
      permissions:[{name:args.permission,codename: renderCodeName()}],
      permissionsSlug:[renderCodeName()],
  
  })

  let permissionLocalStorage = JSON.parse(localStorage.getItem("profile"))?.permissions[0].name
  if(args.permission != permissionLocalStorage){
    localStorage.setItem("profile",data)
 
  }
  
}, [args.permission]);
return <MarkDownParser {...args} />;
};

export const Default = Component.bind({});
Default.args = {
  withToc: false,
  frontMatter,
  content: `
  ## The box-sizing property

  This important property is connected to box model and it defines how the height and width of the element are calculated: should include the border, padding and margin or not. 

  + If the value is **content-box**, width and height will only be applied to the content of the element.
  + If the value is **border-box**, width and height apply to all parts of the elements: content, padding and borders. 


  <iframe width="100%" height="300" src="//jsfiddle.net/BreatheCode/zvL6aet3/2/embed/html,css,result/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

  <div align="right"><small><a href="https://jsfiddle.net/BreatheCode/zvL6aet3/">Click here to open demo in a new window</a></small></div>




  # Width and Height


  Every box has width and height.  You can set these properties to be relative to their parent content (another box or even the body), but, in some cases, we have to set their value manually.



  Ok, now… to understand what we just explained, there is no other choice but… Practice!


  <iframe width="100%" height="300" src="//jsfiddle.net/BreatheCode/kevomsyq/2/embedded/html,css,result/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>
`,
};
export const BeforeAfter = Component.bind({});
BeforeAfter.args = {
  content: `
  ## Before and After

  + Make sure you add image url for before and after
  <before-after before="https://picsum.photos/id/237/700" after="https://picsum.photos/id/238/700"/>  
`,
};
export const Checkbox = Component.bind({});
Checkbox.args = {
  content: `
  ## Checkbox
  
  - [ ] example checkbox1  
  - [ ] example checkbox2  
  - [ ] example checkbox3  
`,
};
export const Onlyfor = Component.bind({});

Onlyfor.args = {
  
  content:`
  ## OnlyFor 
<div class="onlyfor">
<h3>Select permission on dropdown, and then refresh page to see result</h3>
  <onlyfor  permission="join_mentorship" >If this text shows, assisant role has access to this permission</onlyfor>
  <onlyfor  permission="get_my_certificate" >If this text shows, student role has access to this permission</onlyfor>
  <onlyfor  permission="add_code_review" >If this text shows, teacher role has access to this permission</onlyfor>
</div>

`,
};



