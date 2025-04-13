/* @jsx createElement */

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function createElement(
  type: string | Function,
  props: any,
  ...children: any[]
) {
  if (typeof type === "function") {
    return type({ ...props, children });
  }

  const element = document.createElement(type);
  Object.assign(element, props);
  if (props) {
    ["click", "submit"].forEach((event) => {
      const handler = props[`on${capitalize(event)}`];
      if (handler) {
        element.addEventListener(event, handler);
      }
    });
  }
  children.forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((childItem) => element.append(childItem));
      return;
    }
    element.append(child);
  });
  return element;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "open" | "closed";
  toggle(): void;
}

interface CustomComment {
  id: number;
  content: string;
}

function TicketList({
  ticketList,
  commentList,
  addComment,
}: {
  ticketList: Ticket[];
  commentList: CustomComment[][];
  addComment: ({ id, content }: { id: number; content: string }) => void;
}) {
  return (
    <div id="ticket-list">
      {ticketList.map((ticket) => (
        <TicketItem
          ticket={ticket}
          commentList={commentList}
          addComment={addComment}
        />
      ))}
    </div>
  );
}

function TicketItem({
  ticket,
  commentList,
  addComment,
}: {
  ticket: Ticket;
  commentList: CustomComment[][];
  addComment: ({ id, content }: { id: number; content: string }) => void;
}) {
  const handleClick = () => {
    ticket.toggle();
  };

  return (
    <li>
      <div className="title">{ticket.title}</div>
      <div className="description">{ticket.description}</div>
      <button className="status" onClick={handleClick}>
        {ticket.status === "open" ? "Open" : "Closed"}
      </button>
      <CustomComment
        ticketId={ticket.id}
        addComment={addComment}
        commentList={commentList[ticket.id]}
      />
    </li>
  );
}

function CustomComment({
  ticketId,
  commentList,
  addComment,
}: {
  ticketId: number;
  commentList: CustomComment[];
  addComment: ({ id, content }: { id: number; content: string }) => void;
}) {
  function onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const content = formData.get("content") as string;

    addComment({ id: ticketId, content: content });
  }

  return (
    <div id="comment-container">
      <form onSubmit={onSubmit}>
        <label>Comment</label>
        <input type="text" name="content" />
        <button type="submit">Submit</button>
      </form>
      <div id="comment-list">
        {commentList &&
          commentList.map((comment) => <span>{comment.content}</span>)}
      </div>
    </div>
  );
}

function Form({
  addTicket,
}: {
  addTicket: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => void;
}) {
  function onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    addTicket({ title, description });
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="ticket-title">Title</label>
      <input type="text" name="title" id="ticket-title" placeholder="Title" />
      <label htmlFor="ticket-description">Description</label>
      <input
        name="description"
        id="ticket-description"
        placeholder="Description"
      />
      <button type="submit">Add Ticket</button>
    </form>
  );
}

function render({
  root,
  ticketList,
  addTicket,
  commentList,
  addComment,
}: {
  root: HTMLElement;
  ticketList: Ticket[];
  addTicket: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => void;
  commentList: CustomComment[][];
  addComment: ({ id, content }: { id: number; content: string }) => void;
}) {
  root.replaceChildren(
    <div>
      <TicketList
        ticketList={ticketList}
        commentList={commentList}
        addComment={addComment}
      />
      <Form addTicket={addTicket} />
    </div>
  );
}

const root = document.getElementById("root");

if (root) {
  const ticketList: Ticket[] = [];
  const commentList: CustomComment[][] = [[]];

  const update = () => {
    render({ root, ticketList, addTicket, commentList, addComment });
  };

  function addTicket({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) {
    const id = Math.max(...ticketList.map((ticket) => ticket.id), 0) + 1;
    const ticket: Ticket = {
      id,
      title,
      description,
      status: "open",
      toggle() {
        this.status = this.status === "open" ? "closed" : "open";
        update();
      },
    };

    ticketList.push(ticket);
    commentList.push([]);
    update();
  }

  function addComment({ id, content }: { id: number; content: string }) {
    const commentid =
      Math.max(...commentList[id].map((comment) => comment.id), 0) + 1;
    const comment = {
      id: commentid,
      content: content,
    };

    commentList[id].push(comment);
    update();
  }

  update();
}
