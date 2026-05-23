<script>
    import { browser } from "$app/environment";
    import { Button, Column, Row, Heading } from "duckylib";

</script>
<Column textWrap={true} textAlign="center" widthPercent={60} marginLeftPx="auto" marginRightPx="auto">
    <Heading size={2} weight="bold">What are you doing?</Heading>
    <Heading size={5} weight="semibold">The page you're looking for doesn't exist.</Heading>
    <Row heightPx="fit" marginTopPx={20}>
        <Button label="🏡 Back to Home" 
        // onclick={() => {if(browser){window.location.replace("/")}}} 
        href="/" size="large" type="primary" />
        <Button label="View Commands" 
        // onclick={() => {if(browser){window.location.replace("/commands")}}} 
        href="/commands" size="large" type="primary" />
    </Row>
</Column>