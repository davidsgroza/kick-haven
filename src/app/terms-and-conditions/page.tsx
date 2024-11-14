"use client";

import { useRouter } from "next/navigation";

/**
 * Terms and Conditions page for the forum.
 *
 * This page displays the terms and conditions that users must agree to when registering.
 * It includes a button to navigate back to the registration page.
 */
const TermsAndConditionsPage = () => {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center my-12 bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4">Terms and Conditions</h1>
        <hr className="border-gray-600 my-4" />
        <p className="text-gray-200 mb-4">
          Please read the following terms and conditions carefully. By
          registering and using our platform, you agree to the following terms:
        </p>

        <div className="text-gray-300 mb-4">
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the kickHaven website (the
            &ldquo;Site&rdquo;), including any subdomains, pages, services,
            features, or content offered on the Site, you agree to be bound by
            these Terms and Conditions. If you do not agree to these terms, you
            must immediately stop using the Site.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">2. Eligibility</h2>
          <p>
            To use kickHaven, you must be at least 13 years old. By using the
            Site, you represent and warrant that you meet this age requirement.
            If you are under 18, you must have the permission of a parent or
            legal guardian to use the Site.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">3. User Accounts</h2>
          <p>
            To access certain features of the Site, you may be required to
            create an account. You agree to provide accurate, current, and
            complete information during the registration process. You are
            responsible for maintaining the confidentiality of your account
            information, including your password. You agree to notify us
            immediately if you believe your account has been compromised.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">4. User Conduct</h2>
          <p>
            You agree not to use the Site for any unlawful or prohibited
            activity, including, but not limited to:
          </p>
          <ul>
            <li>
              4.1. Engaging in harassment, hate speech, or any form of abusive
              behavior.
            </li>
            <li>
              4.2. Posting or transmitting illegal content, including but not
              limited to offensive, defamatory, or unlawful material.
            </li>
            <li>
              4.3. Impersonating any person or entity, or falsely representing
              your affiliation with any person or entity.
            </li>
            <li>
              4.4. Spamming or engaging in other disruptive activities that
              interfere with the functionality of the Site.
            </li>
          </ul>
          <p>
            kickHaven reserves the right to suspend or terminate accounts that
            violate these terms.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">5. Privacy and Data Collection</h2>
          <p>
            Your use of the Site is governed by our Privacy Policy, which
            explains how we collect, use, and protect your personal information.
            By using the Site, you consent to the collection and use of your
            information in accordance with our Privacy Policy.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">
            6. Third-Party Links and Content
          </h2>
          <p>
            The Site may contain links to third-party websites or services that
            are not owned or controlled by kickHaven. We are not responsible for
            the content, privacy policies, or practices of third-party websites.
            You acknowledge and agree that kickHaven shall not be responsible or
            liable for any damage or loss caused by your use of such third-party
            websites or services.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">7. Prohibited Activities</h2>
          <p>
            You agree not to engage in any of the following prohibited
            activities:
          </p>
          <ul>
            <li>
              7.1. Engaging in any activity that harms, disrupts, or interferes
              with the operation of the Site or its services.
            </li>
            <li>
              7.2. Using the Site for any unlawful purpose, including any
              actions that may violate intellectual property rights, privacy
              laws, or other legal protections.
            </li>
            <li>
              7.3. Attempting to bypass security measures or gain unauthorized
              access to the Site, user accounts, or any related infrastructure.
            </li>
          </ul>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">8. Termination</h2>
          <p>
            kickHaven reserves the right to suspend or terminate your access to
            the Site, with or without notice, for any reason, including but not
            limited to violation of these Terms and Conditions.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">
            9. Disclaimers and Limitations of Liability
          </h2>
          <p>
            The Site is provided &ldquo;as is&rdquo; and &ldquo;as
            available,&rdquo; without warranty of any kind, express or implied,
            including but not limited to any implied warranties of
            merchantability or fitness for a particular purpose.
            <br />
            kickHaven shall not be liable for any damages arising out of or in
            connection with your use of the Site, including but not limited to
            direct, indirect, incidental, special, or consequential damages.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless kickHaven, its affiliates,
            employees, and partners from any claim, damage, loss, or expense
            arising out of your use of the Site or any violation of these Terms
            and Conditions.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">11. Changes to the Terms</h2>
          <p>
            kickHaven reserves the right to update or modify these Terms and
            Conditions at any time. We will notify users of any significant
            changes by posting the updated terms on this page with an updated
            effective date. It is your responsibility to review these Terms
            periodically for any changes.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">12. Governing Law</h2>
          <p>
            These Terms and Conditions shall be governed by and construed in
            accordance with the laws of The Republic of Latvia. Any dispute
            arising out of or in connection with these Terms and Conditions
            shall be resolved in the courts located in The Republic of Latvia.
          </p>
          <hr className="border-gray-600 my-4" />
          <h2 className="font-semibold mt-4">13. Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions or the
            Site, please contact us at:
          </p>

          <ul>
            <li>Email: kick-haven@gmail.com</li>
            <li>Phone: +371 264123123</li>
            <li>Address: 5 Skolas Street, Riga</li>
          </ul>
          <hr className="border-gray-600 my-4" />
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/")}
              className="w-full p-2 text-white hover:text-white bg-blue-500 rounded-lg hover:bg-blue-700 active:bg-blue-900 transition duration-200"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TermsAndConditionsPage;
