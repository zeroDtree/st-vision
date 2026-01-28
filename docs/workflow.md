# Chat Image Generator Workflow

- [Chat Image Generator Workflow](#chat-image-generator-workflow)
	- [1. Overview](#1-overview)
	- [2. Architecture](#2-architecture)
	- [3. Event Handling System](#3-event-handling-system)
		- [3.1. Event Configuration](#31-event-configuration)
		- [3.2. Event Processing Flow](#32-event-processing-flow)
	- [4. Message Processing Flow](#4-message-processing-flow)
		- [4.1. Tag Detection and Replacement](#41-tag-detection-and-replacement)
		- [4.2. Tag Pattern Matching](#42-tag-pattern-matching)
	- [5. Prompt Processing Flow](#5-prompt-processing-flow)
		- [5.1. Prompt Parsing Pipeline](#51-prompt-parsing-pipeline)
		- [5.2. smartBuildPrompt Function](#52-smartbuildprompt-function)
		- [5.3. Character Block Parsing](#53-character-block-parsing)
	- [6. Image Generation and Storage](#6-image-generation-and-storage)
		- [6.1. Generation Flow](#61-generation-flow)
		- [6.2. Image Storage Structure](#62-image-storage-structure)
		- [6.3. Image Retrieval](#63-image-retrieval)
	- [7. Complete Workflow Example](#7-complete-workflow-example)
	- [8. Key Components](#8-key-components)
		- [8.1. Event Handler (`handleEvent`)](#81-event-handler-handleevent)
		- [8.2. Message Scanner (`scanMessages`)](#82-message-scanner-scanmessages)
		- [8.3. Message Processor (`processMessage`)](#83-message-processor-processmessage)
		- [8.4. Prompt Parser (`smartBuildPrompt`)](#84-prompt-parser-smartbuildprompt)
		- [8.5. Image Generator (`generateAndInsertImage`)](#85-image-generator-generateandinsertimage)
		- [8.6. Image Storage (`saveImageToChat`, `saveToGlobalHistory`)](#86-image-storage-saveimagetochat-savetoglobalhistory)
	- [9. Configuration](#9-configuration)
	- [10. Performance Optimizations](#10-performance-optimizations)
	- [11. Error Handling](#11-error-handling)



## 1. Overview

The Chat Image Generator is a SillyTavern extension that automatically detects image generation tags in chat messages and converts them into interactive buttons. When clicked, these buttons generate images using NovelAI API and display them inline within the chat.

## 2. Architecture

```mermaid
graph TB
    A[SillyTavern Event System] -->|Events| B[Event Handler]
    B -->|Triggers| C[scanMessages]
    C -->|Processes| D[processMessage]
    D -->|Extracts| E[Tag Pattern Matching]
    E -->|Creates| F[Generate Buttons]
    F -->|User Clicks| G[generateAndInsertImage]
    G -->|Parses| H[smartBuildPrompt]
    H -->|Calls| I[NovelAI API]
    I -->|Returns| J[Image Data]
    J -->|Saves| K[Image History]
    J -->|Displays| L[Gallery Component]
```

## 3. Event Handling System

The extension listens to various SillyTavern events to detect when messages are created, updated, or rendered.

### 3.1. Event Configuration

```mermaid
graph LR
    A[Event Types] --> B[Message Events]
    A --> C[Chat Events]
    B --> D[MESSAGE_SENT<br/>MESSAGE_RECEIVED<br/>MESSAGE_EDITED<br/>MESSAGE_UPDATED<br/>MESSAGE_DELETED<br/>MESSAGE_SWIPED<br/>MESSAGE_RENDERED]
    C --> E[CHAT_CHANGED<br/>CHAT_LOADED<br/>CHAT_CREATED<br/>CHAT_DELETED<br/>GROUP_CHAT_*]
    
    D --> F[Event Handler]
    E --> F
    F --> G{clearProcessed?}
    G -->|Yes| H[Clear Cache]
    G -->|No| I[Keep Cache]
    H --> J[Delay]
    I --> J
    J --> K[scanMessages]
```

### 3.2. Event Processing Flow

```mermaid
sequenceDiagram
    participant ST as SillyTavern
    participant EH as Event Handler
    participant SM as scanMessages
    participant PM as processMessage
    participant DOM as DOM Elements

    ST->>EH: Event Fired (e.g., MESSAGE_RECEIVED)
    EH->>EH: Check eventConfig
    EH->>EH: Clear processedMessages? (if needed)
    EH->>EH: Wait for delay (100-2000ms)
    EH->>SM: Trigger scanMessages()
    SM->>SM: Get context.chat
    SM->>SM: Query DOM for .mes elements
    SM->>SM: Match messages with DOM elements
    loop For each message
        SM->>PM: processMessage(message, element)
        PM->>PM: Check if already processed
        PM->>PM: Extract tags from message.mes
        PM->>PM: Replace tags with buttons
        PM->>DOM: Update message element
    end
```

## 4. Message Processing Flow

### 4.1. Tag Detection and Replacement

```mermaid
flowchart TD
    A[processMessage Called] --> B{Message Valid?}
    B -->|No| Z[Exit]
    B -->|Yes| C{Already Processed?}
    C -->|Yes| Z
    C -->|No| D{Feature Enabled?}
    D -->|No| Z
    D -->|Yes| E[Extract Message Content]
    E --> F[Build Tag Pattern Regex]
    F --> G[Match All Tags in Content]
    G --> H{Tags Found?}
    H -->|No| Z
    H -->|Yes| I[Create Temporary DOM]
    I --> J[Loop Through Matches]
    J --> K[Extract Text Before Tag]
    K --> L[Create Container Element]
    L --> M[Create Generate Button]
    M --> N[Collect History Images]
    N --> O[Render Gallery]
    O --> P[Append to Temp DOM]
    P --> Q{More Tags?}
    Q -->|Yes| J
    Q -->|No| R[Append Remaining Text]
    R --> S[Replace Original Content]
    S --> T[Mark as Processed]
```

### 4.2. Tag Pattern Matching

The system uses configurable tag prefixes and suffixes (default: `[img:` and `]`) to identify image generation prompts:

```javascript
// Example: [img:cat playing in garden]
// Pattern: /\[img:([\s\S]*?)\]/g
// Match: fullTag = "[img:cat playing in garden]"
//        prompt = "cat playing in garden"
```

```mermaid
graph LR
    A[Original Message] -->|Contains| B[Tag Pattern]
    B -->|Matches| C[Extract Prompt]
    C -->|Creates| D[Button with Prompt]
    D -->|Stores| E[promptKey]
    E -->|Links| F[Message + Prompt]
```

## 5. Prompt Processing Flow

### 5.1. Prompt Parsing Pipeline

```mermaid
flowchart TD
    A[User Clicks Generate] --> B[generateAndInsertImage]
    B --> C{Already Generating?}
    C -->|Yes| Z[Exit]
    C -->|No| D[Add to generatingPrompts Set]
    D --> E[Disable Button]
    E --> F[Call smartBuildPrompt]
    F --> G[Parse Prompt Text]
    G --> H{Has Characters?}
    H -->|Yes| I[Multi-Character Mode]
    H -->|No| J[Simple Mode]
    
    I --> K[Parse Character Blocks]
    K --> L[Extract Positions]
    L --> M[Build V4 Prompt Format]
    M --> N[Build V4 Negative Prompt]
    
    J --> O[Clean Prompt Text]
    O --> P[Extract Negative Tags]
    
    N --> Q[Generate Parameters]
    P --> Q
    Q --> R[Call NovelAI API]
```

### 5.2. smartBuildPrompt Function

```mermaid
graph TB
    A[smartBuildPrompt] --> B[Combine Prefix + Prompt + Suffix]
    B --> C[parsePrompt]
    C --> D{Contains Character Blocks?}
    D -->|Yes| E[Parse Character Blocks]
    E --> F[Extract Character Prompts]
    F --> G[Extract Positions]
    G --> H[Extract Negative Tags]
    H --> I[Build V4 Format]
    D -->|No| J[Clean Simple Prompt]
    J --> K[Extract Negative Tags]
    I --> L[Return Parsed Result]
    K --> L
```

### 5.3. Character Block Parsing

For multi-character prompts, the system supports a special syntax:

```
{char character1 description, ntags = negative tags, {pos_x:0.3, pos_y:0.5} char}
```

```mermaid
flowchart LR
    A[Character Block] --> B[Extract Character Name]
    B --> C[Extract Prompt]
    C --> D[Extract Negative Tags]
    D --> E[Extract Position]
    E --> F[Build Character Object]
    F --> G[Add to characterPrompts Array]
```

## 6. Image Generation and Storage

### 6.1. Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant Button
    participant Generator
    participant Parser
    participant API as NovelAI API
    participant Storage
    participant Gallery

    User->>Button: Click Generate
    Button->>Generator: generateAndInsertImage()
    Generator->>Generator: Check generatingPrompts Set
    Generator->>Generator: Disable Button
    Generator->>Parser: smartBuildPrompt()
    Parser->>Parser: Parse Prompt
    Parser-->>Generator: Return Parsed Prompt
    Generator->>API: generateImage(params)
    API-->>Generator: Image Data (dataURL)
    Generator->>Storage: saveImageToChat()
    Storage->>Storage: Create Image Entry
    Storage->>Storage: Save to Global History
    Storage->>Storage: Save to Message.extra
    Storage-->>Generator: Saved Image Reference
    Generator->>Gallery: renderGallery()
    Gallery->>Gallery: Display Image
    Generator->>Generator: Enable Button
```

### 6.2. Image Storage Structure

```mermaid
graph TB
    A[Generated Image] --> B[Image Entry]
    B --> C[imageId: Unique ID]
    B --> D[dataURL: Base64 Image]
    B --> E[prompt: Original Prompt]
    B --> F[promptKey: Message + Prompt]
    B --> G[timestamp: Generation Time]
    B --> H[Metadata]
    
    H --> I[characterName]
    H --> J[chatId]
    H --> K[messageId]
    H --> L[isUser]
    
    B --> M[Global History]
    B --> N[Message.extra]
    
    M --> O[extensionSettings.st_vision.imageHistory]
    N --> P[message.extra.st_vision_images]
```

### 6.3. Image Retrieval

```mermaid
flowchart TD
    A[collectImagesForPrompt] --> B[Get promptKey]
    B --> C[Search Message.extra.st_vision_images]
    C --> D[Search Global History]
    D --> E[Merge Results]
    E --> F[Remove Duplicates]
    F --> G[Sort by Timestamp]
    G --> H[Return Image Array]
```

## 7. Complete Workflow Example

```mermaid
sequenceDiagram
    participant User
    participant ST as SillyTavern
    participant Event as Event System
    participant Scanner as Message Scanner
    participant Processor as Message Processor
    participant Button as Generate Button
    participant Parser as Prompt Parser
    participant API as NovelAI
    participant Storage as Image Storage
    participant UI as Gallery UI

    User->>ST: Sends Message: "Look at this [img:cat]"
    ST->>Event: MESSAGE_SENT Event
    Event->>Scanner: scanMessages() after 500ms
    Scanner->>Processor: processMessage(message, element)
    Processor->>Processor: Find [img:cat] tag
    Processor->>UI: Create button with prompt "cat"
    Processor->>Storage: collectImagesForPrompt()
    Storage-->>UI: Return existing images (if any)
    UI->>UI: Display button + gallery
    
    User->>Button: Click "Generate Image"
    Button->>Parser: smartBuildPrompt("cat")
    Parser->>Parser: Parse and clean prompt
    Parser-->>Button: Return parsed prompt
    Button->>API: generateImage(parsedPrompt)
    Note over Button,API: Generating image...
    API-->>Button: Return image dataURL
    Button->>Storage: saveImageToChat()
    Storage->>Storage: Save to global history
    Storage->>Storage: Save to message.extra
    Storage-->>Button: Return image reference
    Button->>UI: renderGallery(images)
    UI->>UI: Display new image in gallery
```

## 8. Key Components

### 8.1. Event Handler (`handleEvent`)
- Centralized event processing
- Configurable per-event behavior (clear cache, delay)
- Automatic handler registration/cleanup

### 8.2. Message Scanner (`scanMessages`)
- Iterates through all chat messages
- Matches messages with DOM elements using `mesid`
- Calls `processMessage` for each message

### 8.3. Message Processor (`processMessage`)
- Checks if message already processed (deduplication)
- Extracts image generation tags using regex
- Replaces tags with interactive UI elements
- Maintains text order and structure

### 8.4. Prompt Parser (`smartBuildPrompt`)
- Handles prefix/suffix combination
- Parses complex multi-character prompts
- Supports V4 format with coordinates
- Extracts negative prompts

### 8.5. Image Generator (`generateAndInsertImage`)
- Prevents duplicate generation (using Set)
- Updates UI during generation
- Calls NovelAI API
- Saves and displays results

### 8.6. Image Storage (`saveImageToChat`, `saveToGlobalHistory`)
- Saves to global extension settings
- Saves to message metadata
- Maintains history limit (1000 images)
- Creates unique image IDs

## 9. Configuration

The system uses configurable tag patterns:
- `tagPrefix`: Default `[img:`
- `tagSuffix`: Default `]`
- `enabled`: Feature toggle

These can be changed in the settings panel, and the regex pattern is dynamically rebuilt.

## 10. Performance Optimizations

1. **Message Deduplication**: Uses `processedMessages` Set to avoid reprocessing
2. **Generation Deduplication**: Uses `generatingPrompts` Set to prevent concurrent generation
3. **Event Debouncing**: Configurable delays prevent excessive scanning
4. **DOM Batching**: Creates temporary DOM, then replaces in one operation
5. **History Limit**: Caps global history at 1000 images

## 11. Error Handling

- Try-catch blocks around critical operations
- Button state restoration on errors
- Console logging for debugging
- User-friendly error messages
