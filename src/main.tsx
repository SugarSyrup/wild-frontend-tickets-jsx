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

function TicketList({ ticketList }: { ticketList: Ticket[] }) {
  return (
    <div id="ticket-list">
      {ticketList.map((ticket) => (
        <TicketItem ticket={ticket} />
      ))}
    </div>
  );
}

function TicketItem({ ticket }: { ticket: Ticket }) {
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
    </li>
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
}) {
  root.replaceChildren(
    <div>
      <TicketList ticketList={ticketList} />
      <Form addTicket={addTicket} />
    </div>
  );
}

const root = document.getElementById("root");

if (root) {
  const ticketList: Ticket[] = [];

  const update = () => {
    render({ root, ticketList, addTicket });
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
    update();
  }

  update();
}
