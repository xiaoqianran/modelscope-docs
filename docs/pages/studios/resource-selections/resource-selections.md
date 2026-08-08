<!-- modelscope-docs: Studio Resource Specifications | studios/resource-selections/resource-selections_EN.md -->

ModelScope platform provides users with various resource specifications for deploying Studios.

# Free Resources
For each new user using Studios, ModelScope provides basic CPU machines (2v CPU/16GB) to run application code deployed to Studios.

## Notes

- These free resources belong to the user. Please do not use computing resources for illegal activities.
- If an instance remains unused for a period of time, it will enter sleep mode and will be activated upon re-access.
- ModelScope community will launch more activities in the future to provide free GPU computing resources. Stay tuned!


# Upgraded Resources
ModelScope platform collaborates with Alibaba Cloud to provide paid upgraded resources for users. The relevant machine resources are provided by Alibaba Cloud PAI-EAS, including various CPU/GPU machine specifications. Users can purchase these resources independently and use them for Studio deployment.

Using upgraded resources requires binding an Alibaba Cloud account and activating related services:

## Bind Alibaba Cloud Account and Activate PAI

To use upgraded resources, you need to first bind an Alibaba Cloud account and activate PAI-related services. When creating a Studio and selecting upgraded resources in the cloud resource specifications, if your current account has not yet been bound or activated, you will be guided through the following process to complete the binding and activation:
![resource1](./_resources/studio-resource-1.png)

## Deploy Studios Using Paid Resources

![resource2](./_resources/studio-resource-2.png)

## Notes
- Services are billed hourly after creation. You can configure sleep time as needed, and no charges apply during sleep periods.
- After creation, you can change the resource specifications on the Studio settings page.
- If set as a public Studio, any user's access will keep the Studio running or trigger it to go online, resulting in charges.