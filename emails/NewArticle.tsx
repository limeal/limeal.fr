import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Column,
  Row,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.SITE_URL
  ? `https://${process.env.SITE_URL}`
  : "";

export const NewArticle = ({
  slug,
}: {
  slug: string;
}) => (
  <Html>
    <Head />
    <Preview>Un nouvel article à été publié!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src="https://firebasestorage.googleapis.com/v0/b/limealfr.appspot.com/o/limeal-removebg-preview.png?alt=media&token=95ac42d5-c3dc-4887-a263-e897b88b901f"
            width="50"
            height="50"
            alt="Logo"
          />
          <Hr style={hr} />
          <Text style={paragraph}>
            Un nouvel article à été publié sur le blog: {baseUrl + "/blog/" + slug}
          </Text>
          <Hr style={hr} />
          <Row>
            <Column>
              <Link href="https://discord.com/users/983030818794532914">
                <Img src="https://logodownload.org/wp-content/uploads/2017/11/discord-logo-4-1.png" alt="Discord" width={20} height={20} />
              </Link>
            </Column>
            <Column>
              <Link href="https://github.com/limeal">
                <Img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/2048px-Octicons-mark-github.svg.png" alt="Github" width={20} height={20} />
              </Link>
            </Column>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default NewArticle;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#525f7f",

  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const anchor = {
  color: "#556cd6",
};

const button = {
  backgroundColor: "#656ee8",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
