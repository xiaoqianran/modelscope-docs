<!-- modelscope-docs: Magicube Rewards Program | magicube/intro/intro_EN.md -->

# Magicube Rewards Program

To encourage you to explore models and services on ModelScope, engage with the community, and contribute your own creations, we offer the **Magicube** rewards program — a system of free compute Magicubes and incentives that reward active participation.

Magicubes come in two types: **short-term Magicubes** (valid for 24 hours) and **long-term Magicubes** (valid for 90 days). You can earn Magicubes through different community activities, and redeem them for **Civision inference**, **Civision training**, and **API Inference** services.

**ModelScope reserves the right of final interpretation of these rules and may update them from time to time based on operational needs.**

## 1. How Earning Works

The Magicube program rewards you through multiple tiers: **Daily Login Bonus**, **Account Linking Bonus**, **Community Engagement**, and **Community Contributions**. Magicubes are granted automatically once you complete a qualifying action. You can view the full rules and your earning history on the [Magicube page](https://modelscope.ai/magicube/usage?tab=earn).

| **Category** | **Action** | **Reward** | **Details** | **Frequency Cap** |
| --- | --- | --- | --- | --- |
| Daily Login Bonus | Sign in | **200 Magicubes/day** `short-term` | Issued daily upon login; valid for the current day only (does not roll over) | Once per day |
| Account Linking Bonus | Link Alibaba Cloud account | **50 Magicubes/day** `short-term` | Issued daily upon login after linking your Alibaba Cloud account; valid for the current day only (does not roll over) | Once per day |
| Community Engagement – Interactions | Post a comment | **5 Magicubes** `short-term` | Comment on another user's post | Up to 2× per day |
|  | Favorite / Like | **2 Magicubes** `short-term` | Favorite or like another user's post | Up to 20× per day |
| Community Engagement – Profile Setup | Verify email | **50 Magicubes** `long-term` | Add and verify your [email address](https://modelscope.ai/my/settings/account) | One-time only |
|  | Write a bio | **50 Magicubes** `long-term` | Fill in your bio under [Settings → Profile](https://modelscope.ai/my/settings/profile) and save | One-time only |
|  | Customize your profile page | **50 Magicubes** `long-term` | Pin featured items on your [profile page](https://modelscope.ai/profile) and save | One-time only |
| Community Engagement – Referrals | Refer a friend | **20 Magicubes/person** `long-term` | A new user signs up with your referral code | Up to 50 people/month |
|  | Sign up via referral | **50 Magicubes** `long-term` | Register for the first time using a referral code | One-time only |
| Community Contributions | Publish a Civision creation | **10 Magicubes** `short-term` | Share a creation (image or video output) in Civision and views ≥ 1 | Up to 10× per day |
|  | Publish a Civision model | **10 Magicubes** `short-term` | Publish a public LoRA model trained in Civision | Up to 5× per day |
|  | Civision creation views milestone | **20 Magicubes** `long-term` | A Civision creation reaches ≥ 100 views and ≥ 3 likes | Unlimited |
|  | Civision creation engagement milestone | **20 Magicubes** `long-term` | A Civision creation receives ≥ 10 interactions (remixes、comments or likes) from other users | Unlimited |
|  | Civision model impact | **50 Magicubes** `long-term` | A Civision model reaches ≥ 10 inference runs and ≥ 5 likes | Up to 5× per day |
|  | Model impact (non-Civision) | **50 Magicubes** `long-term` | A non-Civision model reaches ≥ 100 downloads and ≥ 5 likes | Unlimited |
|  | Dataset impact | **50 Magicubes** `long-term` | A dataset reaches ≥ 100 downloads and ≥ 5 likes | Unlimited |
|  | Studio impact | **50 Magicubes** `long-term` | A Studio reaches ≥ 100 views and ≥ 5 likes | Unlimited |
|  | Studio duplicated by others | **10 Magicubes** `long-term` | Another user duplicates your Studio | Up to 10× per Studio |
|  | Course / Article impact | **50 Magicubes** `long-term` | A course or article reaches ≥ 100 views and ≥ 5 likes | Unlimited |
|  | MCP Server impact | **50 Magicubes** `long-term` | An MCP Server reaches ≥ 1,000 calls and ≥ 10 likes | Unlimited |
|  | Skill impact | **50 Magicubes** `long-term` | A Skill reaches ≥ 100 downloads and ≥ 5 likes | Unlimited |

## 2. How Magicubes Are Spent

### Civision Inference & Training

Civision inference covers image generation (Agentic, Quick, and Pro modes) and video generation. Civision training covers image model fine-tuning, image-editing model fine-tuning, and video model fine-tuning.

#### Base Cost

The Magicube cost depends on the compute resources each task requires:

*   **Model size**: Larger models generally cost more Magicubes per run.
    
*   **Image generation**: Cost scales with the number of images produced.
    
*   **Video generation**: Cost scales with resolution (480p / 720p) and clip duration.
    
*   **Training**: Cost scales with the total number of training steps.
    

The actual cost shown on the confirmation screen before you run a task is what will be charged.


#### Premium Options

*   **High-resolution upscaling**: 2× upscale costs 1.5× Magicubes; 4× upscale costs 2× Magicubes.
    
*   **Priority training**: Costs 4× Magicubes (unlocks a higher image cap and elevated training queue priority).
    
*   **Gated model training**: Costs 2× Magicubes.
    

Note: Enabling both Priority training and Gated model training together results in a 5× multiplier.

### API Inference

API Inference costs are grouped into three tiers based on model size and compute requirements:

*   **Lightweight models**: ~0.5 Magicubes per call
    
*   **Standard models**: ~1 Magicube per call
    
*   **Flagship models**: ~2 Magicubes per call

## 3. Important Notes

1.  **Magicube Expiration & Deduction Order**
    
    *   **Short-term Magicubes** expire **24 hours** after issuance.
        
    *   **Long-term Magicubes** expire **90 days** after issuance.
        
    *   Both types are functionally identical when spending. The system automatically deducts whichever Magicubes are **closest to expiring** first.
        
2.  **Failed Task Refunds**
    
    *   If an inference or training task fails due to a system error, the full Magicube cost is **refunded automatically**.
        
    *   If you **cancel a task manually**,  the magicuble cost of training still will be consumed and the cost of inference will be refunded.
        
3.  **Community Guidelines**: All contributions and interactions must comply with the ModelScope [Terms of Service & Privacy Policy](https://modelscope.ai/docs/agreements/terms). Malicious behavior may result in suspension of rewards privileges and blacklisting.
    
4.  **Support & Appeals**: If you encounter any issues with Magicubes or related features, join the [ModelScope Discord](https://discord.gg/hgKcfgXHAQ) and post in the **#ask-for-help** channel — our team is happy to assist.