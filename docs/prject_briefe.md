# Project Brief — MatchFrame

## 1. General Project Introduction

MatchFrame is a website for men who have profiles on dating apps or dating websites and want to understand which of their photos have the highest chance of attracting attention, creating trust, receiving likes, messages, or matches from women.

In this platform, only men are the main users who upload their photos. The male user uploads between 2 and 10 photos of himself to the website. Then, with the help of AI, the system evaluates the reactions of 100 simulated female profiles to those photos.

These 100 voters are not real people. They are AI profiles that simulate women with different tastes, scenarios, lifestyles, and decision-making criteria.

At the end, the system ranks the male user's photos based on vote count, probability of attracting attention from women, trustworthiness, image quality, first impression, and suitability for a dating profile.

The final output is presented as a report that can be viewed in the dashboard and sent to the user by email.

## 2. Product Goal

The goal of MatchFrame is not simply to choose the most beautiful photo. The goal is to help men understand, if they want to use their photos in a dating profile, which order they should upload them in to increase their chances of receiving attention, clicks, likes, messages, or matches from women.

The product should help the male user understand:

- Which photo is most suitable as the first profile photo.
- Which three photos are the strongest from women's perspective and why they were selected.
- Which photos are weaker and why.
- What the recommended order of photos should be in a dating profile.
- What feeling each photo creates from the perspective of different women.
- Which photo communicates more trust, attractiveness, warmth, maturity, positive energy, or seriousness.
- What recommendations exist for improving the visual profile.

The main focus of the product should be this question:

> "If this man wants to create a profile on a dating app, which photos would perform better from women's perspective?"

## 3. General System Workflow

The male user uploads his photos. The system first evaluates the photos in terms of quality, face clarity, lighting, background, overall feeling, trustworthiness, naturalness, and suitability for a dating profile.

Then, 100 female AI profiles are created. These profiles should resemble real women with different tastes, scenarios, preferences, and personalities. Each female AI profile votes between the male user's photos and briefly records the reason for her choice.

At the end, the system aggregates the votes and displays the result as a clear and understandable report for the male user.

**Very important note:** The user should not be able to detect that this voting process is being performed by AI. Therefore, the voting order should always be ready and viewable in the dashboard at least after 6 hours or 24 hours, and the user should be notified by email.

## 4. Main Project Technologies

- The project frontend will be developed with **Next.js**.
- **Tailwind CSS** will be used for styling.
- The website must be fully responsive and provide a good user experience on mobile, tablet, and desktop.
- **Dark Mode** must be supported in the design.
- **Supabase** will be used for the backend, storage, database, files, and authentication.
- Payments will be handled through **Stripe**.
- For the AI section, a **Vision model** will be used that can analyze men's photos and provide structured output for ranking, voting, and report generation.

## 5. Execution Proposal for the AI Section

For the fastest and best result, it is recommended that the AI system in the first version be designed as a multi-step process.

### Step 1: Initial Review of the Male User's Photos

AI should review each photo separately and provide several indicators for each photo:

- Image quality
- Face clarity
- Lighting and framing
- First impression of the photo
- Level of trustworthiness
- Level of naturalness
- Level of warmth and approachability
- Profile attractiveness from women's perspective
- Suitability as the first profile photo
- Suitability for use within the overall set of profile photos
- Strengths of the photo
- Weaknesses of the photo

At this stage, the analysis must not include offensive judgments, harsh appearance-based comments, or sensitive opinions about personal characteristics. The output should be respectful, practical, and product-oriented.

The analysis should focus on what signals the photo communicates from women's perspective, such as trust, positive energy, seriousness, warmth, lifestyle, face clarity, and quality of personal presentation.

### Step 2: Simulating 100 Female AI Voters

The system should create 100 female AI profiles with different characteristics. These profiles should play the role of women who might encounter a man's profile on dating apps.

These female profiles can differ based on the following criteria:

- Age
- Goal of dating
- Lifestyle
- Preference for formal or informal photos
- Sensitivity to photo quality
- Attention to smile
- Attention to style
- Attention to naturalness
- Attention to trustworthiness
- Attention to seriousness or sense of humor
- Attention to a sense of safety and maturity
- Attention to lifestyle and daily activities

Each female AI profile should compare the male user's photos and vote for the photo that is better for starting interaction, creating a positive feeling, and increasing the likelihood of a match.

To reduce cost and increase speed, it is not necessary to send 100 separate requests to AI. It is better to design one or more batch requests where several female personas evaluate the photos at the same time.

### Step 3: Final Scoring and Ranking

After collecting the votes from 100 female AI profiles, the system should sort the photos based on vote count and overall score.

The output for each photo should include:

- Final rank
- Number of votes out of 100
- Vote percentage
- Overall score
- Reason for selection or non-selection
- Dominant impression of the simulated female profiles from that photo
- Suggested role of the photo in the profile, such as: first photo, second photo, supporting photo, lifestyle photo, or photo that can be removed

### Step 4: Final Report Generation

AI should generate a human-readable and understandable report for the male user. This report should not be overly technical. It should feel like a dating profile consultant explaining, in simple and respectful language, why certain photos perform better from women's perspective.

The report should include:

- Recommended photo order for a man's dating profile
- Introduction of the top three photos from women's perspective
- Reason why the first photo was selected
- Reason why the second and third photos were selected
- Photos that should not be used or should be placed lower in priority
- Overall impression of the simulated women from the photo set
- Suggestions for improving future photos
- Final summary

## 6. Expected User Output

After the analysis is complete, the male user should see a report page.

The report should include the following sections:

### 1. Result Summary

A short summary that tells the user which photo is the best choice as his first profile photo from women's perspective and why.

**Example:**

> "Based on the simulated votes of 100 female profiles, photo number 3 is the best option for your first profile photo because your face is clear, it communicates more trust, and compared to the other photos, it appears more natural and approachable."

### 2. Photo Ranking

All uploaded photos should be displayed in the recommended order.

For each photo, the following should be shown:

- Rank
- Number of votes from 100 female AI voters
- Vote percentage
- Suggested label
- Short explanation

**Example labels:**

- Best Main Profile Photo
- Strong Supporting Photo
- Good Lifestyle Photo
- Trust-Building Photo
- Lower Priority
- Not Recommended as First Photo

### 3. Top Three Photos

The top three photos should have a more detailed explanation.

For each one, explain:

- Why this photo received more votes from women's perspective.
- What feeling it communicates to a female viewer.
- What role it should have in a men's dating profile.
- Why it is stronger than the other photos.
- Whether it is suitable as the first photo or better used as a supporting photo.

### 4. Overall Visual Profile Analysis

This section is about the male user's entire set of photos, not just one photo.

For example:

- Is the photo set diverse enough for a male dating profile?
- Do the photos create a sense of trust?
- Do the photos feel natural and relatable from women's perspective?
- Does the user have too many formal photos or too many informal photos?
- Is the first photo clear and suitable enough?
- Do the photos communicate the user's personality, lifestyle, and positive energy?
- Can the combination of photos increase the chance of interaction from women?

### 5. Practical Recommendations

A few simple and practical suggestions for future photos:

- Add a photo with natural lighting.
- Use a clearer front-facing photo.
- Do not use a group photo as the first image.
- A photo with a natural smile may perform better.
- Improve variety between portrait photos, lifestyle photos, and daily activity photos.
- Add a photo that shows the user's real lifestyle or interests.
- Photos that feel overly posed or artificial should be placed lower in priority.

## 7. Suggested User Flow

### Flow 1: New User Entry

1. The user enters the landing page.
2. He clearly sees that this service is designed for men.
3. He sees a short explanation of the product value: choosing the best order of dating profile photos from women's perspective.
4. He views a sample report output.
5. He sees a clarification that the voters are not real women and are simulated by AI.
6. He clicks the start button.
7. He signs up or logs in.
8. He enters the new analysis creation page.

### Flow 2: Creating a New Analysis

1. The male user enters the dashboard.
2. He clicks New Photo Test.
3. The system asks him to upload between 2 and 10 photos of himself.
4. The user uploads the photos.
5. The system displays photo previews.
6. The user can delete or reorder photos.
7. By default, the system clarifies that the AI voters are simulated female profiles.
8. The user confirms and proceeds to the payment step.

**Note:** In the first version, there is no need to select the target audience gender because the product is specifically designed for men, and the voters will always play the role of women.

### Flow 3: Payment

1. The user views the analysis price.
2. He clicks Continue to Payment.
3. Payment is completed through Stripe.
4. After successful payment, the AI analysis begins.
5. The user is redirected to the analysis status page.

### Flow 4: AI Processing

The system displays the processing status.

Messages like the following should be displayed:

- Reviewing your photos
- Simulating feedback from 100 female AI profiles
- Ranking your best dating profile photos
- Preparing your report

After the analysis is complete, the user is transferred to the report page.

If the analysis takes time, the user should be able to view the result later from the dashboard.

After the report is ready, a notification email should be sent to the user.

### Flow 5: Viewing the Report

1. The user enters the report page.
2. At the top of the page, the best recommended photo from women's perspective is displayed.
3. Then the ranking of all photos is displayed.
4. The top three photos are shown with more detailed explanations.
5. The overall report and practical recommendations are displayed.
6. The user can save the report or open its link later from the dashboard.
7. There should be an option to send the report to the user's email.

### Flow 6: User Dashboard

The dashboard should include the following sections:

- List of previous analyses
- Status of each analysis
- Creation date of each analysis
- Number of uploaded photos
- View report button
- Create new analysis button

## 8. Required Main Pages

### 1. Landing Page

The goal of this page is to convert a male visitor into a user.

Suggested sections:

- Hero Section
- Short product explanation with emphasis that the service is for men
- Explanation that men's photos are evaluated by 100 female AI profiles
- How it works in three steps
- Sample report
- Benefits of using the service
- Clarification that the voters are AI
- Price or start button
- FAQ
- Final CTA

### 2. Sign Up / Login

Login and registration through Supabase Auth.

Login can be done with email and password. If possible, Google login can also be added.

### 3. Dashboard

The main user page after login.

The user should be able to create a new analysis and view his previous analyses.

### 4. New Analysis / Upload Photos

Photo upload page.

Main requirements:

- Upload 2 to 10 photos of the male user
- Display preview
- Ability to delete photos
- Ability to reorder photos
- Display file size and format limitations
- Display a clear explanation: "Your photos will be evaluated by 100 female AI profiles."
- Button to continue to payment

### 5. Payment Page

Display order summary and connect to Stripe Checkout.

This page should also include a clear sentence:

> "This analysis is based on simulating the reactions of 100 female AI profiles and does not include votes from real people."

### 6. Processing Page

Waiting page and analysis status display.

### 7. Report Page

The most important page of the product.

This page should be beautiful, clear, trustworthy, and easy to understand.

Main sections:

- Best Photo From Female AI Voters
- Final Ranking
- Top 3 Explanation
- Full Photo Review
- Overall Profile Feedback
- Practical Recommendations
- Email Report CTA

### 8. Account / Settings

User account information management.

Suggested items:

- Email
- Payment history
- Delete account
- Privacy settings

## 9. User Roles

### Regular User

In this product, the regular user is a man who can register, upload his photos, make a payment, create an analysis, and view the report.

### Admin

The admin should be able to view the overall system status.

Suggested items for the admin panel:

- Number of users
- Number of analyses
- Payment statuses
- AI errors
- Generated reports
- Ability to view job statuses
- Ability to manage users if needed

## 10. Important Product Design Principles

- The design should be modern, clean, trustworthy, and minimal.
- Since the male user uploads personal photos, the sense of security, privacy, and seriousness of the product is very important.
- The copy should use a respectful and helpful tone. The product should not judge the user or create a negative feeling.
- Reports should be practical, positive, and actionable. Even when a photo is weaker, the explanation should respectfully describe why it is not suitable as the first photo from women's perspective.
- Dark Mode should be considered from the beginning of the design, not added later in a superficial way.

## 11. Important Privacy and Trust Notes

Because the user uploads face photos and personal images, this section is very important.

The product should clearly state:

- Photos are only used to generate the report.
- There are no real voters, and votes are simulated by AI.
- AI voters are simulated in the role of women.
- The user can view his previous analyses.
- The user should be able to request deletion of his data and photos.
- Photos must not be used for model training, public display, or advertising use without the user's permission.
- The report link should not be public unless the user chooses to make it public.

## 12. AI Content Limitations

AI must not generate outputs that include:

- Insults about the user's appearance
- Humiliating judgments
- Analysis of race, ethnicity, religion, or sensitive characteristics
- Guessing sensitive personal information from the image
- Offensive scoring of the body or appearance
- Unethical or deceptive recommendations for a dating profile
- Offensive gender stereotypes about men or women

The AI's focus should be on photo quality, first impression, trustworthiness, clarity, naturalness, framing, suitability for a dating profile, and probability of generating interaction from women.

## 13. Suggested Report Structure

The final report can have the following structure:

### Report Title

Your Best Dating Profile Photo Order — Based on 100 Female AI Voters

### Summary

A short explanation of which photo should be used first and why it performed best with simulated female AI profiles.

### Final Ranking

- Photo 1 — Rank #1 — 34/100 female AI votes
- Photo 2 — Rank #2 — 27/100 female AI votes
- Photo 3 — Rank #3 — 18/100 female AI votes
- Photo 4 — Rank #4 — 11/100 female AI votes
- Photo 5 — Rank #5 — 10/100 female AI votes

### Top 3 Photos

For each of the top 3 photos:

- Why it performed well with female AI voters
- What impression it creates
- Best use in a male dating profile
- What makes it stronger than the others

### Lower Ranked Photos

For lower-ranked photos:

- Why they received fewer votes from female AI voters
- Whether they should be used or removed
- How they could be improved

### Overall Advice

A final set of practical tips for improving the user's dating profile photos from a female-audience perspective.

## 14. Suggested Revenue Model

In the first version, payment can be pay-per-report.

For example:

- One analysis for 2 to 10 photos
- Payment before AI processing begins
- Viewing the report after payment and processing

In later stages, more advanced plans can be added:

- Re-analysis with new photos
- Comparison between two photo sets
- More advanced report
- Dating profile bio suggestion for men
- Monthly subscription for professional users

## 15. Expected Output from the Developer

The expected output is a complete and usable website that includes:

- Frontend with Next.js
- Responsive design
- Tailwind CSS
- Dark Mode
- Authentication with Supabase
- Storing photos and reports in Supabase
- Payment with Stripe
- Connection to AI for analyzing men's photos
- Simulation of 100 female AI voters
- User dashboard
- Photo upload page
- Processing page
- Report page
- Email notification after the report is ready
- Use Google fonts: Outfit and IBM Plex Sans

## 16. First Version Execution Priorities

For the first version, the focus should be on the following:

- User registration and login
- Uploading 2 to 10 photos by the male user
- Successful payment
- Running AI analysis
- Simulating votes from 100 female AI profiles
- Generating photo ranking
- Generating an understandable report
- Displaying the report in the dashboard
- Sending the report by email or notifying the user when the report is ready

Items such as an advanced admin panel, subscription plans, bio analysis, real A/B testing, and social features can be added in later stages.

## 17. Summary

MatchFrame is an AI tool that helps men who are active on dating apps and dating websites choose the best order for their profile photos from women's perspective.

In this product, men upload their photos, and the system uses AI to evaluate the reactions of 100 simulated female profiles.

The core value of the product is that instead of guessing, the male user receives a structured analysis showing which photos perform better from the perspective of simulated women.

The product should be fast, transparent, trustworthy, beautiful, and simple. The user should be able to upload his photos and complete payment in less than a few minutes, then receive a practical and understandable report after processing.
