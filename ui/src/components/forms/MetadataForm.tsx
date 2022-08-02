import { RawMetadata } from "../../code-text/test-data/fungible"
import Button from "../form/Button"
import Form from "../form/Form"
import Input from "../form/Input"

interface MetadataFormProps {
  metadata: RawMetadata
  setMetadata: (m: RawMetadata) => void
  onSubmit: () => void
}

export const MetadataForm = ({ metadata, setMetadata, onSubmit }: MetadataFormProps) => {
  return (
    <Form style={{ borderRadius: 4, alignItems: 'center' }}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSubmit()
      }}
    >
      <Input
        style={{ width: 300, marginTop: 8 }}
        onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
        value={metadata.name}
        placeholder="name (longform)"
        required
      />
      <Input
        style={{ width: 300, marginTop: 8 }}
        onChange={(e) => setMetadata({ ...metadata, symbol: e.target.value })}
        value={metadata.symbol}
        placeholder="symbol (3-4 characters)"
        required
      />
      <Input
        style={{ width: 300, marginTop: 8 }}
        onChange={(e) => setMetadata({ ...metadata, decimals: e.target.value.replace(/[^0-9]/gi, '') })}
        value={metadata.decimals}
        placeholder="decimals (integer)"
        required
      />
      <Input
        style={{ width: 300, marginTop: 8 }}
        onChange={(e) => setMetadata({ ...metadata, supply: e.target.value.replace(/[^0-9]/gi, '') })}
        value={metadata.supply}
        placeholder="supply (integer)"
        required
      />
      <Input
        style={{ width: 300, marginTop: 8 }}
        onChange={(e) => setMetadata({ ...metadata, cap: e.target.value.replace(/[^0-9]/gi, '') })}
        value={metadata.cap}
        placeholder="cap (optional, integer)"
      />
      <Input
        label="mintable"
        type="checkbox"
        containerStyle={{ width: 300, marginTop: 8, flexDirection: 'row', alignSelf: 'flex-start' }}
        onChange={(e) => setMetadata({ ...metadata, mintable: metadata.mintable ? '' : 't' }) }
        value={metadata.mintable}
        placeholder="mintable"
      />
      <Input
        style={{ width: 300, marginTop: 8 }}
        onChange={(e) => setMetadata({ ...metadata, minters: e.target.value.replace(/[^0-9a-fA-Fx,]/gi, '') })}
        value={metadata.minters}
        placeholder="minters (comma-separated addresses)"
      />
      <Input
        style={{ width: 300, marginTop: 8 }}
        onChange={(e) => setMetadata({ ...metadata, deployer: e.target.value.replace(/[^0-9a-fA-Fx]/gi, '') })}
        value={metadata.deployer}
        placeholder="deployer"
        required
      />
      {/* <Input
        style={{ width: 300, marginTop: 8 }}
        onChange={(e) => setMetadata({ ...metadata, salt: e.target.value.replace(/[^0-9a-fA-Fx]/gi, '') })}
        value={metadata.salt}
        placeholder="salt"
        required
      /> */}
      <Button variant='dark' type="submit" style={{ margin: '16px 0px 8px', width: 240, justifyContent: 'center' }}>
        Next
      </Button>
    </Form>
  )
}